/* BetterCamNorte - Source-backed Camarines Norte homepage history */

(function () {
  'use strict';

  const historyContent = {
    en: {
      timeline: [
        {
          year: '1571–1573',
          text:
            'Spanish expeditions led by <strong>Juan de Salcedo</strong> reached Paracale and Mambulao, communities already known for gold. Spanish colonial control then expanded across Camarines.',
        },
        {
          year: '1829',
          text:
            'The Province of Camarines was formally divided into <strong>Camarines Norte</strong> and <strong>Camarines Sur</strong>.',
        },
        {
          year: '1854–1893',
          text:
            'The two provinces were reunited as <strong>Ambos Camarines</strong> in 1854, separated in 1857, and reunited again in 1893.',
        },
        {
          year: '14–18 Apr 1898',
          text:
            '<strong>Ildefonso Moreno</strong> and local Katipuneros led the Daet Revolt, which spread to Basud, Talisay, and Labo. Many revolutionaries were arrested or killed after Spanish reinforcements arrived.',
        },
        {
          year: '30 Dec 1898',
          text:
            'The <strong>first monument to José Rizal</strong> was unveiled in Daet, built through voluntary contributions led by Lt. Col. Antonio Sanz and Lt. Col. Ildefonso Alegre.',
        },
        {
          year: '1919–1920',
          text:
            '<strong>Act No. 2809</strong> authorized the re-establishment of Camarines Norte with Daet as its capital. The province was organized in 1920 under its first governor, Miguel R. Lukban.',
        },
        {
          year: '1941–1945',
          text:
            '<strong>Wenceslao Q. Vinzons</strong> led resistance to the Japanese occupation. Fighting began at Laniton and Tigbinan in December 1941, and the province was liberated in 1945.',
        },
      ],
      cards: [
        {
          icon: 'bi-map-fill',
          title: 'A Province Re-established',
          text:
            'Modern Camarines Norte took shape through repeated divisions and reunifications before Act No. 2809 restored it as a separate province.',
        },
        {
          icon: 'bi-shield-fill-check',
          title: 'A Heritage of Courage',
          text:
            'From the Daet revolutionaries and the first Rizal monument to the wartime resistance of Wenceslao Vinzons, the province holds a distinct place in Philippine history.',
        },
      ],
      sourcesTitle: 'Historical sources',
      sourcesIntro: 'Timeline checked against provincial, legal, and national historical records:',
    },
    fil: {
      timeline: [
        {
          year: '1571–1573',
          text:
            'Narating ng mga ekspedisyong Kastila sa pamumuno ni <strong>Juan de Salcedo</strong> ang Paracale at Mambulao, mga pamayanang kilala na sa ginto. Sumunod ang paglawak ng pamahalaang kolonyal sa Camarines.',
        },
        {
          year: '1829',
          text:
            'Pormal na hinati ang Lalawigan ng Camarines sa <strong>Camarines Norte</strong> at <strong>Camarines Sur</strong>.',
        },
        {
          year: '1854–1893',
          text:
            'Muling pinagsanib ang dalawang lalawigan bilang <strong>Ambos Camarines</strong> noong 1854, pinaghiwalay noong 1857, at muling pinagsanib noong 1893.',
        },
        {
          year: '14–18 Abr 1898',
          text:
            'Pinamunuan ni <strong>Ildefonso Moreno</strong> at ng mga lokal na Katipunero ang Pag-aalsa sa Daet, na lumaganap sa Basud, Talisay, at Labo. Marami ang dinakip o pinatay matapos dumating ang mga puwersang Kastila.',
        },
        {
          year: '30 Dis 1898',
          text:
            'Inilantad sa Daet ang <strong>unang bantayog kay José Rizal</strong>, na itinayo mula sa kusang ambag ng mamamayan sa pangunguna nina Tenyente Koronel Antonio Sanz at Ildefonso Alegre.',
        },
        {
          year: '1919–1920',
          text:
            'Pinahintulutan ng <strong>Batas Blg. 2809</strong> ang muling pagtatatag ng Camarines Norte, na Daet ang kabisera. Naging organisadong lalawigan ito noong 1920 sa ilalim ng unang gobernador nitong si Miguel R. Lukban.',
        },
        {
          year: '1941–1945',
          text:
            'Pinamunuan ni <strong>Wenceslao Q. Vinzons</strong> ang paglaban sa pananakop ng Hapon. Nagsimula ang mga sagupaan sa Laniton at Tigbinan noong Disyembre 1941, at napalaya ang lalawigan noong 1945.',
        },
      ],
      cards: [
        {
          icon: 'bi-map-fill',
          title: 'Muling Itinatag na Lalawigan',
          text:
            'Nabuo ang makabagong Camarines Norte matapos ang ilang paghahati at pagsasanib bago ito ibinalik bilang hiwalay na lalawigan sa ilalim ng Batas Blg. 2809.',
        },
        {
          icon: 'bi-shield-fill-check',
          title: 'Pamana ng Katapangan',
          text:
            'Mula sa mga rebolusyonaryo ng Daet at unang bantayog kay Rizal hanggang sa paglaban ni Wenceslao Vinzons noong digmaan, natatangi ang lugar ng lalawigan sa kasaysayan ng Pilipinas.',
        },
      ],
      sourcesTitle: 'Mga sangguniang pangkasaysayan',
      sourcesIntro: 'Sinuri ang timeline gamit ang mga rekord ng lalawigan, batas, at pambansang kasaysayan:',
    },
  };

  const sourceLinks = [
    {
      label: 'Provincial Government history',
      href: 'https://camsnorte.com/history/',
    },
    {
      label: 'Act No. 2809 (Lawphil)',
      href: 'https://lawphil.net/statutes/acts/act1919/act_2809_1919.html',
    },
    {
      label: 'NHCP: Martir ng Camarines Norte',
      href: 'https://philhistoricsites.nhcp.gov.ph/registry_database/martir-ng-camarines-norte/',
    },
    {
      label: 'NHCP: Wenceslao Q. Vinzons',
      href: 'https://philhistoricsites.nhcp.gov.ph/registry_database/wenceslao-q-vinzons/',
    },
  ];

  function getLanguage() {
    if (
      window.TranslationEngine &&
      typeof window.TranslationEngine.getCurrentLanguage === 'function'
    ) {
      return window.TranslationEngine.getCurrentLanguage() === 'fil' ? 'fil' : 'en';
    }

    return document.documentElement.lang.toLowerCase().startsWith('fil') ? 'fil' : 'en';
  }

  function renderTimeline(lang) {
    const timeline = document.querySelector('.history-section .history-timeline');
    const summary = document.querySelector('.history-section .history-summary');
    if (!timeline || !summary) return;

    const content = historyContent[lang === 'fil' ? 'fil' : 'en'];

    timeline.innerHTML = content.timeline
      .map(
        (item) => `
          <div class="timeline-item" data-year="${item.year}">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-year">${item.year}</span>
              <p>${item.text}</p>
            </div>
          </div>`
      )
      .join('');

    const cards = content.cards
      .map(
        (card) => `
          <div class="history-card">
            <div class="history-card-icon"><i class="bi ${card.icon}" aria-hidden="true"></i></div>
            <div class="history-card-content">
              <h4>${card.title}</h4>
              <p>${card.text}</p>
            </div>
          </div>`
      )
      .join('');

    const links = sourceLinks
      .map(
        (source) =>
          `<a href="${source.href}" target="_blank" rel="noopener noreferrer">${source.label}</a>`
      )
      .join(' · ');

    summary.innerHTML = `${cards}
      <div class="history-card history-card--sources">
        <div class="history-card-icon"><i class="bi bi-journal-check" aria-hidden="true"></i></div>
        <div class="history-card-content">
          <h4>${content.sourcesTitle}</h4>
          <p>${content.sourcesIntro}</p>
          <p class="history-source-links">${links}</p>
        </div>
      </div>`;
  }

  function initializeHistory() {
    if (!document.querySelector('.history-section')) return;

    renderTimeline(getLanguage());

    if (
      window.TranslationEngine &&
      typeof window.TranslationEngine.addObserver === 'function'
    ) {
      window.TranslationEngine.addObserver(renderTimeline);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHistory, { once: true });
  } else {
    initializeHistory();
  }
})();
