// DPWH Projects Renderer - grounded contract data with progressive loading
(function () {
  'use strict';

  const CONFIG = {
    initialRows: 12,
    loadMoreRows: 12,
    truncateLength: 92,
  };

  let allProjects = [];
  let filteredProjects = [];
  let displayedCount = 0;
  let isLoading = false;

  function escapeHTML(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function text(value, fallback = '—') {
    const normalized = String(value ?? '').trim();
    return normalized || fallback;
  }

  async function loadDPWHProjects() {
    const container = document.getElementById('dpwh-projects-container');
    if (!container) return;

    try {
      const response = await fetch('../data/dpwh-projects.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data.projects)) throw new Error('Invalid projects dataset');

      allProjects = data.projects;
      filteredProjects = [...allProjects];
      renderSection(container, data);
    } catch (error) {
      console.error('Failed to load DPWH projects:', error);
      container.innerHTML = `
        <div class="dpwh-data-error" role="alert">
          <strong>Project data is temporarily unavailable.</strong>
          <span>Please try again later.</span>
        </div>`;
    }
  }

  function formatCurrency(amount) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return '—';
    return `₱${numericAmount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatCompactCurrency(amount) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return '—';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(numericAmount);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function truncateText(value, maxLength) {
    const normalized = text(value);
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.substring(0, maxLength).trim()}…`;
  }

  function categoryKey(category) {
    const normalized = text(category, '').toLowerCase();
    if (normalized.includes('flood') || normalized.includes('drainage')) return 'flood';
    if (normalized.includes('road')) return 'roads';
    if (normalized.includes('bridge')) return 'bridges';
    if (normalized.includes('water')) return 'water';
    if (normalized.includes('building') || normalized.includes('facilit')) return 'buildings';
    return 'other';
  }

  function categoryLabel(category) {
    const labels = {
      flood: 'Flood Control',
      roads: 'Roads',
      bridges: 'Bridges',
      water: 'Water',
      buildings: 'Buildings',
      other: 'Other',
    };
    return labels[categoryKey(category)];
  }

  function normalizedStatus(project) {
    const status = text(project.status, 'Unknown');
    const compact = status.toLowerCase().replace(/[\s-]+/g, '');
    if (compact === 'completed') return 'Completed';
    if (compact === 'ongoing') return 'On-Going';
    if (compact === 'notyetstarted') return 'Not Yet Started';
    if (compact === 'terminated') return 'Terminated';
    return status;
  }

  function isCompleted(project) {
    return normalizedStatus(project) === 'Completed';
  }

  function getStatusBadge(project) {
    const status = normalizedStatus(project);
    const progress = Number(project.progress);
    const safeProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : null;

    if (status === 'Completed') return '<span class="dpwh-badge complete">Completed</span>';
    if (status === 'Terminated') return '<span class="dpwh-badge terminated">Terminated</span>';
    if (status === 'Not Yet Started')
      return '<span class="dpwh-badge pending">Not Yet Started</span>';

    const label = safeProgress === null ? status : `${safeProgress.toFixed(0)}%`;
    return `<span class="dpwh-badge ongoing" title="${escapeHTML(status)}">${escapeHTML(label)}</span>`;
  }

  function getCategoryCounts(projects) {
    const counts = {
      all: projects.length,
      buildings: 0,
      roads: 0,
      bridges: 0,
      flood: 0,
      water: 0,
      other: 0,
    };

    projects.forEach((project) => {
      counts[categoryKey(project.category)] += 1;
    });
    return counts;
  }

  function filterProjects(filter) {
    if (filter === 'all') return [...allProjects];
    return allProjects.filter((project) => categoryKey(project.category) === filter);
  }

  function renderFilterButton(key, label, count, active = false) {
    if (!count && key !== 'all') return '';
    return `<button class="dpwh-tab${active ? ' active' : ''}" data-filter="${key}" role="tab" aria-selected="${active}">${label} <span class="dpwh-tab-count">${count}</span></button>`;
  }

  function renderSection(container, data) {
    const counts = getCategoryCounts(allProjects);
    const completedCount = allProjects.filter(isCompleted).length;
    const ongoingCount = allProjects.filter(
      (project) => normalizedStatus(project) === 'On-Going'
    ).length;
    const asOf = data.as_of ? formatDate(data.as_of) : 'date not stated';
    const scanCount = Number(data.scope?.source_records_scanned);
    const sourceLink = text(data.source_url, 'https://transparency.dpwh.gov.ph/');

    container.innerHTML = `
      <div class="dpwh-summary-bar">
        <div class="dpwh-summary-item">
          <span class="dpwh-summary-value">${allProjects.length.toLocaleString('en-PH')}</span>
          <span class="dpwh-summary-label">Projects</span>
        </div>
        <div class="dpwh-summary-item">
          <span class="dpwh-summary-value">${formatCompactCurrency(data.summary?.totalCost)}</span>
          <span class="dpwh-summary-label">Total Contract Budget</span>
        </div>
        <div class="dpwh-summary-item">
          <span class="dpwh-summary-value">${completedCount.toLocaleString('en-PH')}</span>
          <span class="dpwh-summary-label">Completed</span>
        </div>
        <div class="dpwh-summary-item">
          <span class="dpwh-summary-value">${ongoingCount.toLocaleString('en-PH')}</span>
          <span class="dpwh-summary-label">On-Going</span>
        </div>
      </div>

      <div class="dpwh-provenance" role="note">
        <i class="bi bi-database-check"></i>
        <span>
          Official DPWH Transparency Portal snapshot as of <strong>${escapeHTML(asOf)}</strong>.
          ${Number.isFinite(scanCount) ? `${scanCount.toLocaleString('en-PH')} source records scanned; ` : ''}${allProjects.length.toLocaleString('en-PH')} unique Camarines Norte contracts matched.
          <a href="${escapeHTML(sourceLink)}" target="_blank" rel="noopener noreferrer">Open official source</a>
        </span>
      </div>

      <div class="dpwh-controls">
        <div class="dpwh-filter-group" role="tablist" aria-label="Filter projects by category">
          ${renderFilterButton('all', 'All', counts.all, true)}
          ${renderFilterButton('buildings', 'Buildings', counts.buildings)}
          ${renderFilterButton('roads', 'Roads', counts.roads)}
          ${renderFilterButton('bridges', 'Bridges', counts.bridges)}
          ${renderFilterButton('flood', 'Flood Control', counts.flood)}
          ${renderFilterButton('water', 'Water', counts.water)}
          ${renderFilterButton('other', 'Other', counts.other)}
        </div>
      </div>

      <div class="dpwh-table-wrap">
        <table class="dpwh-table" role="table">
          <thead>
            <tr>
              <th scope="col" class="col-desc">Contract Description</th>
              <th scope="col" class="col-contractor">Contractor</th>
              <th scope="col" class="col-cost">Budget</th>
              <th scope="col" class="col-status">Status</th>
              <th scope="col" class="col-date">Completion</th>
            </tr>
          </thead>
          <tbody id="dpwh-table-body"></tbody>
        </table>
        <div id="dpwh-load-more" class="dpwh-load-more"></div>
      </div>`;

    displayedCount = 0;
    loadMoreRows();
    attachEventListeners();
  }

  function renderRows(projects, startIndex, count) {
    const endIndex = Math.min(startIndex + count, projects.length);
    let html = '';

    for (let index = startIndex; index < endIndex; index += 1) {
      const project = projects[index];
      const contractorId = project.contractorId
        ? `<span class="dpwh-contractor-id">DPWH contractor #${escapeHTML(project.contractorId)}</span>`
        : '';
      const category = categoryKey(project.category);

      html += `
        <tr class="dpwh-row">
          <td class="col-desc">
            <div class="dpwh-desc-wrap">
              <span class="dpwh-proj-id">${escapeHTML(project.id)}</span>
              <span class="dpwh-cat-badge ${category}">${escapeHTML(categoryLabel(project.category))}</span>
              ${project.infraYear ? `<span class="dpwh-year">${escapeHTML(project.infraYear)}</span>` : ''}
            </div>
            <span class="dpwh-proj-title" title="${escapeHTML(project.name)}">${escapeHTML(truncateText(project.name, CONFIG.truncateLength))}</span>
            <span class="dpwh-proj-location"><i class="bi bi-geo-alt"></i>${escapeHTML(text(project.location))}</span>
          </td>
          <td class="col-contractor">
            <span class="dpwh-contractor">${escapeHTML(text(project.contractor, 'Not stated in source'))}</span>
            ${contractorId}
          </td>
          <td class="col-cost">${formatCurrency(project.budget ?? project.cost)}</td>
          <td class="col-status">${getStatusBadge(project)}</td>
          <td class="col-date">${formatDate(project.completionDate)}</td>
        </tr>`;
    }
    return html;
  }

  function loadMoreRows() {
    if (isLoading) return;

    const tbody = document.getElementById('dpwh-table-body');
    const loadMoreElement = document.getElementById('dpwh-load-more');
    if (!tbody || !loadMoreElement) return;

    const remaining = filteredProjects.length - displayedCount;
    if (remaining <= 0) {
      updateLoadMoreButton();
      return;
    }

    isLoading = true;
    const rowsToLoad = displayedCount === 0 ? CONFIG.initialRows : CONFIG.loadMoreRows;

    if (displayedCount > 0) {
      loadMoreElement.innerHTML = '<div class="dpwh-skeleton-row"></div>'.repeat(
        Math.min(rowsToLoad, remaining)
      );
    }

    setTimeout(
      () => {
        tbody.insertAdjacentHTML(
          'beforeend',
          renderRows(filteredProjects, displayedCount, rowsToLoad)
        );
        displayedCount = Math.min(displayedCount + rowsToLoad, filteredProjects.length);
        isLoading = false;
        updateLoadMoreButton();
      },
      displayedCount === 0 ? 0 : 100
    );
  }

  function updateLoadMoreButton() {
    const loadMoreElement = document.getElementById('dpwh-load-more');
    if (!loadMoreElement) return;

    const remaining = filteredProjects.length - displayedCount;
    if (remaining <= 0) {
      loadMoreElement.innerHTML = `<span class="dpwh-end-msg">Showing all ${filteredProjects.length.toLocaleString('en-PH')} projects</span>`;
      return;
    }

    loadMoreElement.innerHTML = `
      <button class="dpwh-load-btn" id="dpwh-load-btn">
        Load More <span class="dpwh-remaining">(${remaining.toLocaleString('en-PH')} remaining)</span>
      </button>`;
    document.getElementById('dpwh-load-btn')?.addEventListener('click', loadMoreRows);
  }

  function handleFilterChange(filter) {
    document.querySelectorAll('.dpwh-tab').forEach((tab) => {
      const isActive = tab.dataset.filter === filter;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    filteredProjects = filterProjects(filter);
    displayedCount = 0;
    const tbody = document.getElementById('dpwh-table-body');
    if (tbody) tbody.innerHTML = '';
    loadMoreRows();
  }

  function attachEventListeners() {
    document.querySelectorAll('.dpwh-tab').forEach((tab) => {
      tab.addEventListener('click', () => handleFilterChange(tab.dataset.filter));
    });

    const loadMoreElement = document.getElementById('dpwh-load-more');
    if (loadMoreElement && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoading) loadMoreRows();
        },
        { rootMargin: '120px' }
      );
      observer.observe(loadMoreElement);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDPWHProjects);
  } else {
    loadDPWHProjects();
  }
})();
