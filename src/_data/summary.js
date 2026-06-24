// Build-time DPWH spending summary for the hero proof line + homepage snapshot.
// Derived from data/dpwh-projects.json every build so the numbers can never drift
// from the dataset (the bug that produced the old hand-typed "₱409.5M / 63").
// Headline = strict "Camarines Norte DEO" tag; Region V contracts disclosed separately.
const fs = require('fs');
const path = require('path');

const peso = (n) => '₱' + (n / 1e9).toFixed(1) + 'B';
const sum = (arr) => arr.reduce((t, p) => t + (Number(p.cost) || 0), 0);

const summarize = (raw) => {
  raw = raw || {};
  const projects = Array.isArray(raw.projects)
    ? raw.projects.filter(
        (project) =>
          project &&
          typeof project.id === 'string' &&
          typeof project.name === 'string' &&
          typeof project.officialProvince === 'string'
      )
    : [];
  const source =
    typeof raw.source === 'string'
      ? raw.source
      : raw.source && typeof raw.source.name === 'string'
        ? raw.source.name
        : '';
  const deo = projects.filter((p) => p.officialProvince === 'Camarines Norte DEO');
  return {
    source,
    source_url: raw.source_url,
    as_of: raw.as_of,
    deoCount: deo.length,
    regionVCount: projects.length - deo.length,
    totalCount: projects.length,
    deoCostDisplay: peso(sum(deo)),
    totalCostDisplay: peso(sum(projects)),
  };
};

module.exports = function () {
  const raw = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../data/dpwh-projects.json'), 'utf8')
  );
  return summarize(raw);
};

module.exports.summarize = summarize;
