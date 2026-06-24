// Version loader for BetterCamNorte
// Dynamically updates version display across all pages

(function () {
  'use strict';

  const VERSION_FILE = '/version.json';

  async function loadVersion() {
    try {
      const response = await fetch(VERSION_FILE);
      if (!response.ok) throw new Error('Version file not found');

      const data = await response.json();
      updateVersionDisplay(data.version);

      // Store in window for programmatic access
      window.BETTERCAMNORTE_VERSION = data;
    } catch (error) {
      console.warn('Could not load version:', error.message);
    }
  }

  function updateVersionDisplay(version) {
    // Update footer version elements
    const versionElements = document.querySelectorAll('.footer-version');
    versionElements.forEach((el) => {
      const icon = el.querySelector('i');
      el.innerHTML = '';
      if (icon) el.appendChild(icon.cloneNode(true));
      el.appendChild(document.createTextNode(' Ver. ' + version));
    });

    // Update any element with data-version attribute
    document.querySelectorAll('[data-version]').forEach((el) => {
      el.textContent = version;
    });
  }

  function loadHomepageHistory() {
    if (!document.querySelector('.history-section')) return;
    if (document.querySelector('script[data-history-timeline]')) return;

    const script = document.createElement('script');
    script.src = '/assets/js/history-timeline.js';
    script.dataset.historyTimeline = 'true';
    document.head.appendChild(script);
  }

  function initialize() {
    loadVersion();
    loadHomepageHistory();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
