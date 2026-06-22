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

const fs = require("fs");
const path = require("path");

// Datasets that render public *figures*. Records (ordinances/resolutions/officials)
// and the Citizen's-Charter-backed services list are out of scope.
const FIGURE_DATASETS = {
  "dpwh-projects.json": "projects",
  "fiscal_transparency.json": "fiscal_years",
  "demographics.json": "barangays",
};

const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/; // YYYY | YYYY-MM | YYYY-MM-DD

// Pure core so it's testable. Returns [] when clean, else array of problem strings.
function lint(name, json, figuresKey) {
  const figures = Array.isArray(json[figuresKey]) ? json[figuresKey] : [];
  if (figures.length === 0) return []; // empty draft — nothing on display yet
  const problems = [];
  const srcName =
    typeof json.source === "string" ? json.source : json.source && json.source.name;
  if (!srcName || !String(srcName).trim()) problems.push("missing `source` (name of the issuing body)");
  if (!json.source_url || !/^https?:\/\//.test(json.source_url))
    problems.push("missing `source_url` (link to the official source)");
  if (!json.as_of || !DATE_RE.test(json.as_of))
    problems.push("missing/invalid `as_of` (YYYY[-MM[-DD]] the figures are current as of)");
  return problems.map((p) => `${name} [${figures.length} figures]: ${p}`);
}

// news items each carry their own source link — soft rule (warn, never block).
function lintNews(json) {
  const items = Array.isArray(json.news) ? json.news : [];
  const unsourced = items.filter((n) => !n.url || !/^https?:\/\//.test(n.url));
  return unsourced.map((n) => `news.json: item "${n.id || n.title}" has no source url`);
}

function run({ strict }) {
  const dataDir = path.join(__dirname, "..", "data");
  const errors = [];
  for (const [file, key] of Object.entries(FIGURE_DATASETS)) {
    const p = path.join(dataDir, file);
    if (!fs.existsSync(p)) continue;
    errors.push(...lint(file, JSON.parse(fs.readFileSync(p, "utf8")), key));
  }
  const warnings = [];
  const newsPath = path.join(dataDir, "news.json");
  if (fs.existsSync(newsPath))
    warnings.push(...lintNews(JSON.parse(fs.readFileSync(newsPath, "utf8"))));

  for (const w of warnings) console.log(`  ⚠ ${w}`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  if (!errors.length && !warnings.length) {
    console.log("  ✓ every rendered figure dataset is sourced & dated");
    return 0;
  }
  console.log(
    `\n  ${errors.length} figure-dataset gap(s), ${warnings.length} news warning(s).` +
      (strict ? " (--strict: failing build)" : " (warning only; run with --strict to enforce)")
  );
  return strict && errors.length ? 1 : 0;
}

function selftest() {
  const assert = require("assert");
  // clean
  assert.deepStrictEqual(
    lint("x.json", { source: "DPWH", source_url: "https://x", as_of: "2024-01-31", projects: [{}] }, "projects"),
    []
  );
  // empty draft skipped
  assert.deepStrictEqual(lint("x.json", { projects: [] }, "projects"), []);
  // each gap caught
  assert.strictEqual(lint("x.json", { projects: [{}] }, "projects").length, 3);
  // object source + bad date
  assert.deepStrictEqual(
    lint("x.json", { source: { name: "A" }, source_url: "https://a", as_of: "Jan 2024", projects: [{}] }, "projects").length,
    1
  );
  // news soft rule
  assert.strictEqual(lintNews({ news: [{ id: "a", url: null }, { id: "b", url: "https://b" }] }).length, 1);
  console.log("selftest OK");
}

const args = process.argv.slice(2);
if (args.includes("--selftest")) selftest();
else process.exit(run({ strict: args.includes("--strict") }));
