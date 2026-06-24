// Build-time DPWH spending summary for the hero proof line + homepage snapshot.
// Derived from data/dpwh-projects.json every build so the numbers can never drift
// from the dataset (the bug that produced the old hand-typed "₱409.5M / 63").
// Headline = strict "Camarines Norte DEO" tag; Region V contracts disclosed separately.
const fs = require('fs');
const path = require('path');

const peso = (n) => '₱' + (n / 1e9).toFixed(1) + 'B';
const sum = (arr) => arr.reduce((t, p) => t + (Number(p.cost) || 0), 0);

module.exports = function () {
  const raw = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../data/dpwh-projects.json'), 'utf8')
  );
  const projects = raw.projects || [];
  const deo = projects.filter((p) => p.officialProvince === 'Camarines Norte DEO');
  return {
    source: raw.source,
    source_url: raw.source_url,
    as_of: raw.as_of,
    deoCount: deo.length,
    regionVCount: projects.length - deo.length,
    totalCount: projects.length,
    deoCostDisplay: peso(sum(deo)),
    totalCostDisplay: peso(sum(projects)),
  };
};
