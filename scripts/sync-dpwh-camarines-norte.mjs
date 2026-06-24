#!/usr/bin/env node

/**
 * Build data/dpwh-projects.json from the public DPWH Transparency API.
 *
 * Inclusion rule:
 *   - the official location.province field contains "Camarines Norte"; OR
 *   - the official contract description contains "Camarines Norte".
 *
 * The second condition retains projects implemented by a regional office whose
 * location field is only "Region V" but whose contract description expressly
 * places the work in Camarines Norte.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PRIMARY_API = 'https://api.transparency.dpwh.gov.ph/projects';
const FALLBACK_API = 'https://api.dpwh.bettergov.ph/projects';
const PORTAL_URL = 'https://transparency.dpwh.gov.ph/';
const PAGE_LIMIT = 5000;
const MIN_EXPECTED_MATCHES = 100;
const MAX_RETRIES = 5;
const REQUEST_DELAY_MS = 250;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, '../data/dpwh-projects.json');

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function normalizeText(value) {
  return String(value ?? '')
    .replace(/=\s*\n/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeStatus(value) {
  const status = normalizeText(value);
  if (!status) return 'Unknown';

  const compact = status.toLowerCase().replace(/[\s-]+/g, '');
  if (compact === 'ongoing') return 'On-Going';
  if (compact === 'notyetstarted') return 'Not Yet Started';
  if (compact === 'completed') return 'Completed';
  if (compact === 'terminated') return 'Terminated';
  return status;
}

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function dateOnly(value) {
  if (!value) return null;
  const date = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function contractorParts(value) {
  const contractor = normalizeText(value) || 'Not stated in source';
  const match = contractor.match(/\((\d+)\)\s*$/);
  return {
    contractor,
    contractorId: match?.[1] ?? null,
  };
}

function getPayload(body) {
  if (Array.isArray(body)) {
    return {
      projects: body,
      pagination: { page: 1, totalPages: 1, totalCount: body.length, limit: body.length },
    };
  }

  const outer = body?.data ?? body;
  const projects = Array.isArray(outer?.data)
    ? outer.data
    : Array.isArray(outer?.projects)
      ? outer.projects
      : Array.isArray(outer?.results)
        ? outer.results
        : Array.isArray(outer)
          ? outer
          : [];

  const pagination = outer?.pagination ?? body?.pagination ?? {
    page: 1,
    totalPages: 1,
    totalCount: projects.length,
    limit: projects.length,
  };

  return { projects, pagination };
}

async function fetchJson(url, attempt = 1) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-PH,en;q=0.9',
      Origin: PORTAL_URL.replace(/\/$/, ''),
      Referer: PORTAL_URL,
      'User-Agent': 'BetterCamNorte-DPWH-Sync/1.0 (+https://bettercamnorte.org/)',
    },
    signal: AbortSignal.timeout(90_000),
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok || !contentType.includes('application/json')) {
    const body = (await response.text()).slice(0, 300);
    const error = new Error(`HTTP ${response.status} from ${url}: ${body}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function fetchWithRetry(url) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await fetchJson(url, attempt);
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES) break;
      const backoff = Math.min(30_000, 1_500 * 2 ** (attempt - 1));
      console.warn(`Request failed (${attempt}/${MAX_RETRIES}): ${error.message}`);
      await sleep(backoff);
    }
  }

  throw lastError;
}

async function downloadAllProjects(apiBase) {
  const firstUrl = `${apiBase}?page=1&limit=${PAGE_LIMIT}`;
  const firstBody = await fetchWithRetry(firstUrl);
  const first = getPayload(firstBody);

  if (!first.projects.length) {
    throw new Error(`No projects returned by ${apiBase}`);
  }

  const totalPages = Math.max(1, Number(first.pagination.totalPages) || 1);
  const expectedTotal = Number(first.pagination.totalCount) || first.projects.length;
  const projects = [...first.projects];

  console.log(`Source ${apiBase}: ${expectedTotal} records across ${totalPages} page(s).`);

  for (let page = 2; page <= totalPages; page += 1) {
    await sleep(REQUEST_DELAY_MS);
    const body = await fetchWithRetry(`${apiBase}?page=${page}&limit=${PAGE_LIMIT}`);
    const payload = getPayload(body);
    projects.push(...payload.projects);
    console.log(`Fetched page ${page}/${totalPages}: ${projects.length}/${expectedTotal}`);
  }

  if (projects.length < expectedTotal) {
    throw new Error(`Incomplete download from ${apiBase}: received ${projects.length}, expected ${expectedTotal}`);
  }

  return { projects, expectedTotal };
}

async function getSourceProjects() {
  const candidates = [PRIMARY_API, FALLBACK_API];
  const failures = [];

  for (const apiBase of candidates) {
    try {
      const result = await downloadAllProjects(apiBase);
      return { ...result, apiBase };
    } catch (error) {
      failures.push(`${apiBase}: ${error.message}`);
      console.warn(`Unable to use ${apiBase}; trying the next source.`);
    }
  }

  throw new Error(`All DPWH API sources failed:\n${failures.join('\n')}`);
}

function isCamarinesNorteProject(project) {
  const location = project?.location ?? {};
  const province = normalizeText(location.province ?? project.province).toLowerCase();
  const description = normalizeText(project.description ?? project.projectName ?? project.name).toLowerCase();
  return province.includes('camarines norte') || description.includes('camarines norte');
}

function normalizeProject(project) {
  const location = project?.location ?? {};
  const officialProvince = normalizeText(location.province ?? project.province) || null;
  const region = normalizeText(location.region ?? project.region) || null;
  const description = normalizeText(project.description ?? project.projectName ?? project.name);
  const contractId = normalizeText(project.contractId ?? project.contract_id ?? project.id);
  const { contractor, contractorId } = contractorParts(project.contractor);
  const status = normalizeStatus(project.status);
  const progress = Math.max(-100, Math.min(100, toFiniteNumber(project.progress, status === 'Completed' ? 100 : 0)));

  let displayLocation = officialProvince;
  if (!displayLocation || !displayLocation.toLowerCase().includes('camarines norte')) {
    displayLocation = region ? `Camarines Norte · ${region}` : 'Camarines Norte';
  } else if (region) {
    displayLocation = `${displayLocation} · ${region}`;
  }

  const componentCategories = Array.isArray(project.componentCategories)
    ? project.componentCategories.map(normalizeText).filter(Boolean)
    : normalizeText(project.componentCategories)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    id: contractId,
    name: description,
    location: displayLocation,
    officialProvince,
    region,
    category: normalizeText(project.category) || 'Other Infrastructure',
    componentCategories,
    contractor,
    contractorId,
    cost: toFiniteNumber(project.budget),
    budget: toFiniteNumber(project.budget),
    amountPaid: toFiniteNumber(project.amountPaid),
    status,
    progress,
    startDate: dateOnly(project.startDate),
    completionDate: dateOnly(project.completionDate),
    infraYear: normalizeText(project.infraYear) || null,
    programName: normalizeText(project.programName) || null,
    sourceOfFunds: normalizeText(project.sourceOfFunds) || null,
    isLive: Boolean(project.isLive),
    livestreamUrl: normalizeText(project.livestreamUrl) || null,
    latitude: toNullableNumber(project.latitude),
    longitude: toNullableNumber(project.longitude),
    reportCount: Math.max(0, Math.trunc(toFiniteNumber(project.reportCount))),
    hasSatelliteImage: Boolean(project.hasSatelliteImage),
  };
}

function statusCounts(projects) {
  const counts = {
    completedProjects: 0,
    ongoingProjects: 0,
    notStartedProjects: 0,
    terminatedProjects: 0,
    unknownStatusProjects: 0,
  };

  for (const project of projects) {
    switch (project.status) {
      case 'Completed':
        counts.completedProjects += 1;
        break;
      case 'On-Going':
        counts.ongoingProjects += 1;
        break;
      case 'Not Yet Started':
        counts.notStartedProjects += 1;
        break;
      case 'Terminated':
        counts.terminatedProjects += 1;
        break;
      default:
        counts.unknownStatusProjects += 1;
    }
  }

  return counts;
}

function sortProjects(a, b) {
  const yearDifference = Number(b.infraYear || 0) - Number(a.infraYear || 0);
  if (yearDifference) return yearDifference;

  const statusPriority = { 'On-Going': 0, 'Not Yet Started': 1, Completed: 2, Terminated: 3, Unknown: 4 };
  const statusDifference = (statusPriority[a.status] ?? 4) - (statusPriority[b.status] ?? 4);
  if (statusDifference) return statusDifference;

  const budgetDifference = b.budget - a.budget;
  if (budgetDifference) return budgetDifference;
  return a.id.localeCompare(b.id);
}

async function main() {
  const retrievedAt = new Date();
  const { projects: sourceProjects, expectedTotal, apiBase } = await getSourceProjects();

  const matched = sourceProjects.filter(isCamarinesNorteProject).map(normalizeProject);
  const unique = new Map();

  for (const project of matched) {
    if (!project.id) {
      console.warn(`Skipping project without contract ID: ${project.name.slice(0, 80)}`);
      continue;
    }
    unique.set(project.id, project);
  }

  const projects = [...unique.values()].sort(sortProjects);
  if (projects.length < MIN_EXPECTED_MATCHES) {
    throw new Error(
      `Safety check failed: only ${projects.length} Camarines Norte projects matched; expected at least ${MIN_EXPECTED_MATCHES}.`
    );
  }

  const statuses = statusCounts(projects);
  const totalCost = projects.reduce((sum, project) => sum + project.budget, 0);
  const years = projects.map((project) => Number(project.infraYear)).filter(Number.isFinite);

  const output = {
    source: 'Department of Public Works and Highways (DPWH) Transparency Portal',
    source_url: PORTAL_URL,
    api_source_url: apiBase,
    official_api_url: PRIMARY_API,
    as_of: retrievedAt.toISOString().slice(0, 10),
    retrieved_at: retrievedAt.toISOString(),
    scope: {
      geography: 'Camarines Norte',
      inclusion_rule:
        'Included when the official DPWH location.province field or contract description contains “Camarines Norte”.',
      reason:
        'The description fallback retains Region V-implemented contracts whose province field is regional rather than provincial.',
      source_records_scanned: expectedTotal,
      matched_before_deduplication: matched.length,
      unique_contracts: projects.length,
    },
    summary: {
      totalProjects: projects.length,
      totalCost: Number(totalCost.toFixed(2)),
      ...statuses,
      earliestInfraYear: years.length ? Math.min(...years) : null,
      latestInfraYear: years.length ? Math.max(...years) : null,
      implementingAgency: 'DPWH offices implementing projects located in Camarines Norte',
    },
    projects,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${projects.length} grounded contracts to ${outputPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
