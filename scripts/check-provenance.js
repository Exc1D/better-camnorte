#!/usr/bin/env node
/**
 * Provenance gate — enforces web-principle #2: every figure is sourced & dated.
 *
 * Scope (ponytail: only what's actually rendered today): the fetched data/*.json
 * that drive public figures. A dataset that ships figures MUST declare, at the top
 * level, a `source` (name), a `source_url` (link), and an `as_of` date. Empty/draft
 * datasets are skipped — they trip the gate the moment they're populated.
 *
 * Out of scope (and why): figures hard-coded in JS (e.g. statistics-new.js cmciData)
 * bypass the data layer — a data-file gate can't see them. Folding those into sourced
 * data files is a separate decision, flagged in the redesign plan.
 *
 * Usage:
 *   node scripts/check-provenance.js            report gaps, exit 0 (build warns)
 *   node scripts/check-provenance.js --strict   exit 1 on any gap (build-failing gate)
 *   node scripts/check-provenance.js --selftest  run the self-check
 */

const fs = require('fs');
const path = require('path');

// Datasets that render public *figures*. Records (ordinances/resolutions/officials)
// and the Citizen's-Charter-backed services list are out of scope.
const FIGURE_DATASETS = {
  'dpwh-projects.json': 'projects',
  'fiscal_transparency.json': 'fiscal_years',
  'demographics.json': 'barangays',
};

// Files that hold several independently-sourced figure sets, each carrying its own
// provenance. Map: file -> { section: arrayKeyThatHoldsTheFigures }.
const SECTIONED_DATASETS = {
  'statistics.json': { population: 'municipalities', cmci: 'years' },
};

const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/; // YYYY | YYYY-MM | YYYY-MM-DD

// The three rules, shared by flat and sectioned datasets.
function fieldProblems(obj) {
  const problems = [];
  const srcName = typeof obj.source === 'string' ? obj.source : obj.source && obj.source.name;
  if (!srcName || !String(srcName).trim())
    problems.push('missing `source` (name of the issuing body)');
  if (!obj.source_url || !/^https?:\/\//.test(obj.source_url))
    problems.push('missing `source_url` (link to the official source)');
  if (!obj.as_of || !DATE_RE.test(obj.as_of))
    problems.push('missing/invalid `as_of` (YYYY[-MM[-DD]] the figures are current as of)');
  return problems;
}

// Pure core so it's testable. Returns [] when clean, else array of problem strings.
function lint(name, json, figuresKey) {
  const figures = Array.isArray(json[figuresKey]) ? json[figuresKey] : [];
  if (figures.length === 0) return []; // empty draft — nothing on display yet
  return fieldProblems(json).map((p) => `${name} [${figures.length} figures]: ${p}`);
}

// Each named section is checked independently; empty sections are skipped.
function lintSections(name, json, sections) {
  const out = [];
  for (const [section, figuresKey] of Object.entries(sections)) {
    const obj = json[section];
    const figures = obj && Array.isArray(obj[figuresKey]) ? obj[figuresKey] : [];
    if (!obj || figures.length === 0) continue;
    out.push(...fieldProblems(obj).map((p) => `${name} › ${section}: ${p}`));
  }
  return out;
}

// news items each carry their own source link — soft rule (warn, never block).
function lintNews(json) {
  const items = Array.isArray(json.news) ? json.news : [];
  const unsourced = items.filter((n) => !n.url || !/^https?:\/\//.test(n.url));
  return unsourced.map((n) => `news.json: item "${n.id || n.title}" has no source url`);
}

function run({ strict }) {
  const dataDir = path.join(__dirname, '..', 'data');
  const errors = [];
  for (const [file, key] of Object.entries(FIGURE_DATASETS)) {
    const p = path.join(dataDir, file);
    if (!fs.existsSync(p)) continue;
    errors.push(...lint(file, JSON.parse(fs.readFileSync(p, 'utf8')), key));
  }
  for (const [file, sections] of Object.entries(SECTIONED_DATASETS)) {
    const p = path.join(dataDir, file);
    if (!fs.existsSync(p)) continue;
    errors.push(...lintSections(file, JSON.parse(fs.readFileSync(p, 'utf8')), sections));
  }
  const warnings = [];
  const newsPath = path.join(dataDir, 'news.json');
  if (fs.existsSync(newsPath))
    warnings.push(...lintNews(JSON.parse(fs.readFileSync(newsPath, 'utf8'))));

  for (const w of warnings) console.log(`  ⚠ ${w}`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  if (!errors.length && !warnings.length) {
    console.log('  ✓ every rendered figure dataset is sourced & dated');
    return 0;
  }
  console.log(
    `\n  ${errors.length} figure-dataset gap(s), ${warnings.length} news warning(s).` +
      (strict ? ' (--strict: failing build)' : ' (warning only; run with --strict to enforce)')
  );
  return strict && errors.length ? 1 : 0;
}

function selftest() {
  const assert = require('assert');
  // clean
  assert.deepStrictEqual(
    lint(
      'x.json',
      { source: 'DPWH', source_url: 'https://x', as_of: '2024-01-31', projects: [{}] },
      'projects'
    ),
    []
  );
  // empty draft skipped
  assert.deepStrictEqual(lint('x.json', { projects: [] }, 'projects'), []);
  // each gap caught
  assert.strictEqual(lint('x.json', { projects: [{}] }, 'projects').length, 3);
  // object source + bad date
  assert.deepStrictEqual(
    lint(
      'x.json',
      { source: { name: 'A' }, source_url: 'https://a', as_of: 'Jan 2024', projects: [{}] },
      'projects'
    ).length,
    1
  );
  // news soft rule
  assert.strictEqual(
    lintNews({
      news: [
        { id: 'a', url: null },
        { id: 'b', url: 'https://b' },
      ],
    }).length,
    1
  );
  // sectioned: one clean section, one empty (skipped), one with a gap
  const sec = lintSections(
    's.json',
    {
      ok: { source: 'A', source_url: 'https://a', as_of: '2024', rows: [1] },
      empty: { rows: [] },
      bad: { source: 'B', as_of: '2024', rows: [1] },
    },
    { ok: 'rows', empty: 'rows', bad: 'rows' }
  );
  assert.strictEqual(sec.length, 1); // only `bad` (missing source_url)
  console.log('selftest OK');
}

const args = process.argv.slice(2);
if (args.includes('--selftest')) selftest();
else process.exit(run({ strict: args.includes('--strict') }));
