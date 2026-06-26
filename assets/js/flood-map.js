// Flood-control map: DPWH flood projects plotted over modeled flood-hazard zones.
// Leaflet is self-hosted (assets/vendor/leaflet). CircleMarkers only — no icon images.
(function () {
  'use strict';

  // Camarines Norte; markers re-frame the view once loaded.
  const CENTER = [14.13, 122.79];
  const DEFAULT_PERIOD = '100yr';
  const HAZARD_STYLE = {
    1: { color: '#4292c6', fillColor: '#9ecae1' },
    2: { color: '#2171b5', fillColor: '#4292c6' },
    3: { color: '#08519c', fillColor: '#08519c' },
  };

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

  function formatCurrency(amount) {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return 'Not stated in source';
    return `₱${numeric.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Mirrors dpwh-projects.js categoryKey: flood-control covers flood + drainage works.
  function isFloodControl(project) {
    const category = text(project.category, '').toLowerCase();
    return category.includes('flood') || category.includes('drainage');
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

  function popupHTML(project) {
    const status = normalizedStatus(project);
    const progress = Number(project.progress);
    const statusLine =
      status === 'On-Going' && Number.isFinite(progress)
        ? `${status} · ${progress.toFixed(0)}%`
        : status;
    return `
      <div class="flood-popup">
        <strong class="flood-popup-title">${escapeHTML(text(project.name))}</strong>
        <dl class="flood-popup-meta">
          <div><dt>Status</dt><dd>${escapeHTML(statusLine)}</dd></div>
          <div><dt>Budget</dt><dd>${escapeHTML(formatCurrency(project.budget ?? project.cost))}</dd></div>
          <div><dt>Contractor</dt><dd>${escapeHTML(text(project.contractor, 'Not stated in source'))}</dd></div>
          <div><dt>Completion</dt><dd>${escapeHTML(formatDate(project.completionDate))}</dd></div>
          <div><dt>Location</dt><dd>${escapeHTML(text(project.location))}</dd></div>
        </dl>
        <span class="flood-popup-id">${escapeHTML(text(project.id, ''))}${project.infraYear ? ` · FY ${escapeHTML(project.infraYear)}` : ''}</span>
      </div>`;
  }

  function hazardStyle(feature) {
    const style = HAZARD_STYLE[feature.properties?.hazard] || HAZARD_STYLE[1];
    return { color: style.color, weight: 0.5, fillColor: style.fillColor, fillOpacity: 0.4 };
  }

  async function init() {
    const el = document.getElementById('flood-map');
    if (!el || typeof L === 'undefined') return;

    const map = L.map(el, { scrollWheelZoom: false }).setView(CENTER, 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Hazard polygons sit in their own pane below markers (overlayPane is 400).
    map.createPane('hazard');
    map.getPane('hazard').style.zIndex = 350;

    const hazardCache = {};
    let hazardLayer = null;
    let activePeriod = DEFAULT_PERIOD;
    let hazardToken = 0;

    async function showHazard(period) {
      // Latest click wins: if a newer period is requested while this fetch is in
      // flight, drop the stale result so the map can't end up showing one period
      // while the toolbar says another.
      const token = ++hazardToken;
      if (!hazardCache[period]) {
        const response = await fetch(`../data/flood/flood-${period}.geojson`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        hazardCache[period] = await response.json();
      }
      if (token !== hazardToken) return;
      if (hazardLayer) map.removeLayer(hazardLayer);
      hazardLayer = L.geoJSON(hazardCache[period], {
        pane: 'hazard',
        style: hazardStyle,
      }).addTo(map);
      activePeriod = period;
      syncButtons(period);
    }

    // Project markers (loaded once; independent of the hazard period).
    let projectsLoaded = false;
    try {
      const response = await fetch('../data/dpwh-projects.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const projects = Array.isArray(data.projects) ? data.projects : [];
      const markers = [];
      projects.filter(isFloodControl).forEach((project) => {
        const lat = Number(project.latitude);
        const lng = Number(project.longitude);
        // DPWH encodes "no coordinate" as 0/0; bound to the Philippines so
        // sentinel and out-of-country values don't plot or skew fitBounds.
        if (!(lat >= 4.5 && lat <= 21.5 && lng >= 116 && lng <= 127)) return;
        markers.push(
          L.circleMarker([lat, lng], {
            radius: 5,
            color: '#b71c1c',
            weight: 1.5,
            fillColor: '#e53935',
            fillOpacity: 0.9,
          }).bindPopup(popupHTML(project), { maxWidth: 300 })
        );
      });
      const counter = document.getElementById('flood-map-count');
      if (markers.length) {
        const group = L.featureGroup(markers).addTo(map);
        map.fitBounds(group.getBounds(), { padding: [30, 30], maxZoom: 12 });
        projectsLoaded = true;
        if (counter)
          counter.textContent = `${markers.length} flood-control projects with mapped coordinates`;
      } else if (counter) {
        counter.textContent = 'No flood-control projects to display.';
      }
    } catch (error) {
      console.error('Failed to load flood-control projects:', error);
      const counter = document.getElementById('flood-map-count');
      if (counter) counter.textContent = 'Flood-control project data is unavailable.';
    }

    // Period selector. The active state follows the layer that actually rendered
    // (set inside showHazard), so an out-of-order or failed fetch can't leave the
    // toolbar pointing at a period the map isn't showing.
    const buttons = document.querySelectorAll('.flood-period button');
    function syncButtons(period) {
      buttons.forEach((b) => {
        const on = b.dataset.period === period;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
    }
    buttons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await showHazard(btn.dataset.period);
        } catch (error) {
          console.error('Failed to load hazard layer:', error);
          syncButtons(activePeriod);
        }
      });
    });

    try {
      await showHazard(DEFAULT_PERIOD);
    } catch (error) {
      console.error('Failed to load hazard layer:', error);
      if (!projectsLoaded) {
        el.insertAdjacentHTML(
          'afterbegin',
          '<div class="flood-map-error" role="alert">Map data is temporarily unavailable. Please try again later.</div>'
        );
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
