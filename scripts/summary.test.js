const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const summary = require('../src/_data/summary');

test('summary accepts malformed projects and object source metadata', () => {
  assert.deepEqual(summary.summarize(null), {
    source: '',
    source_url: undefined,
    as_of: undefined,
    deoCount: 0,
    regionVCount: 0,
    totalCount: 0,
    deoCostDisplay: '₱0.0B',
    totalCostDisplay: '₱0.0B',
  });

  assert.deepEqual(summary.summarize({ projects: [null, {}], source: { name: 'DPWH' } }), {
    source: 'DPWH',
    source_url: undefined,
    as_of: undefined,
    deoCount: 0,
    regionVCount: 0,
    totalCount: 0,
    deoCostDisplay: '₱0.0B',
    totalCostDisplay: '₱0.0B',
  });

  assert.deepEqual(
    summary.summarize({
      source: 'DPWH',
      projects: [
        { id: 'deo-1', name: 'DEO project', officialProvince: 'Camarines Norte DEO', cost: 2e9 },
        { id: 'region-1', name: 'Region project', officialProvince: 'Region V', cost: 1e9 },
        { id: 'bad-1', officialProvince: 'Region V', cost: 1e9 },
      ],
    }),
    {
      source: 'DPWH',
      source_url: undefined,
      as_of: undefined,
      deoCount: 1,
      regionVCount: 1,
      totalCount: 2,
      deoCostDisplay: '₱2.0B',
      totalCostDisplay: '₱3.0B',
    }
  );
});

test('health service route has an Eleventy source after React removal', () => {
  assert.equal(fs.existsSync(path.join(__dirname, '../src/services/health.njk')), true);
});
