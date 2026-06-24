const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const summary = require('../src/_data/summary');

test('summary accepts malformed projects and object source metadata', () => {
  assert.deepEqual(summary.summarize({ projects: [null], source: { name: 'DPWH' } }), {
    source: 'DPWH',
    source_url: undefined,
    as_of: undefined,
    deoCount: 0,
    regionVCount: 0,
    totalCount: 0,
    deoCostDisplay: '₱0.0B',
    totalCostDisplay: '₱0.0B',
  });
});

test('health service route has an Eleventy source after React removal', () => {
  assert.equal(fs.existsSync('src/services/health.njk'), true);
});
