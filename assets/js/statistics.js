/**
 * Statistics Page - Chart.js Implementation
 * BetterCamNorte Portal
 */

// Site branding color palette for charts
const CHART_COLORS = {
  primary: '#0032a0',
  primaryDark: '#002170',
  accent: '#F77F00',
  success: '#06A77D',
  danger: '#D62828',
  info: '#0077BE',
  secondary: '#003D82',
};

/**
 * Get chart color palette matching site branding
 * @param {number} count - Number of colors needed
 * @returns {Array} Array of color strings
 */
function getChartColors(count) {
  const palette = [
    CHART_COLORS.primary,
    CHART_COLORS.accent,
    CHART_COLORS.success,
    CHART_COLORS.info,
    CHART_COLORS.danger,
    CHART_COLORS.secondary,
    CHART_COLORS.primaryDark,
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F59E0B', // amber
    '#6366F1', // indigo
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
}

// Municipality population data from PSA PSGC 2024 POPCEN.
const barangayData = [
  { name: 'Labo', population: 108319, classification: 'Municipality' },
  { name: 'Daet', population: 106465, classification: 'Capital' },
  { name: 'Jose Panganiban', population: 60626, classification: 'Municipality' },
  { name: 'Paracale', population: 58391, classification: 'Municipality' },
  { name: 'Mercedes', population: 53702, classification: 'Municipality' },
  { name: 'Vinzons', population: 45173, classification: 'Municipality' },
  { name: 'Basud', population: 43388, classification: 'Municipality' },
  { name: 'Santa Elena', population: 42585, classification: 'Municipality' },
  { name: 'Capalonga', population: 32800, classification: 'Municipality' },
  { name: 'Talisay', population: 26371, classification: 'Municipality' },
  { name: 'San Lorenzo Ruiz', population: 15072, classification: 'Municipality' },
  { name: 'San Vicente', population: 11774, classification: 'Municipality' },
];

// Province totals from 2020 Census and 2024 POPCEN.
const historicalData = {
  years: [2020, 2024],
  populations: [629699, 604666],
};

// Economic indicators data
const economicData = {
  registeredBusinesses: 1200,
  agriculturalLand: 8500, // hectares
  incomeClass: '1st Class',
  landArea: 2277.93, // km²
};

// Chart instances storage
let chartInstances = {};

/**
 * Create population by municipality bar chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Chart} Chart.js instance
 */
function createPopulationBarChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas element ${canvasId} not found`);
    return null;
  }

  // Sort by population (highest to lowest)
  const sortedData = [...barangayData].sort((a, b) => b.population - a.population);

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedData.map((d) => d.name),
      datasets: [
        {
          label: 'Population',
          data: sortedData.map((d) => d.population),
          backgroundColor: CHART_COLORS.primary,
          borderColor: CHART_COLORS.primaryDark,
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Population: ${context.raw.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value.toLocaleString();
            },
          },
        },
      },
      onHover: (event, elements) => {
        event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
      },
    },
  });

  chartInstances[canvasId] = chart;
  return chart;
}

/**
 * Create historical population line chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Chart} Chart.js instance
 */
function createHistoricalLineChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas element ${canvasId} not found`);
    return null;
  }

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: historicalData.years,
      datasets: [
        {
          label: 'Population',
          data: historicalData.populations,
          borderColor: CHART_COLORS.primary,
          backgroundColor: 'rgba(0, 50, 160, 0.1)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: CHART_COLORS.primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Population: ${context.raw.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function (value) {
              return value.toLocaleString();
            },
          },
        },
      },
    },
  });

  chartInstances[canvasId] = chart;
  return chart;
}

/**
 * Create population distribution pie chart
 * @param {string} canvasId - Canvas element ID
 * @returns {Chart} Chart.js instance
 */
function createDistributionPieChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas element ${canvasId} not found`);
    return null;
  }

  // Get top 10 barangays by population
  const top10 = [...barangayData].sort((a, b) => b.population - a.population).slice(0, 10);

  const totalPopulation = barangayData.reduce((sum, b) => sum + b.population, 0);
  const colors = getChartColors(10);

  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: top10.map((d) => d.name),
      datasets: [
        {
          data: top10.map((d) => d.population),
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const percentage = ((context.raw / totalPopulation) * 100).toFixed(1);
              return `${context.label}: ${context.raw.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
    },
  });

  chartInstances[canvasId] = chart;
  return chart;
}

/**
 * Show loading indicator for a chart container
 * @param {string} containerId - Container element ID
 */
function showChartLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.classList.add('chart-loading');
  }
}

/**
 * Hide loading indicator for a chart container
 * @param {string} containerId - Container element ID
 */
function hideChartLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.classList.remove('chart-loading');
  }
}

/**
 * Initialize all charts on the statistics page
 */
function initializeCharts() {
  // Population by Municipality chart
  if (document.getElementById('populationBarChart')) {
    showChartLoading('populationChartContainer');
    createPopulationBarChart('populationBarChart');
    hideChartLoading('populationChartContainer');
  }

  // Historical Population chart
  if (document.getElementById('historicalLineChart')) {
    showChartLoading('historicalChartContainer');
    createHistoricalLineChart('historicalLineChart');
    hideChartLoading('historicalChartContainer');
  }

  // Population Distribution chart
  if (document.getElementById('distributionPieChart')) {
    showChartLoading('distributionChartContainer');
    createDistributionPieChart('distributionPieChart');
    hideChartLoading('distributionChartContainer');
  }
}

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', initializeCharts);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getChartColors,
    barangayData,
    historicalData,
    economicData,
    createPopulationBarChart,
    createHistoricalLineChart,
    createDistributionPieChart,
    initializeCharts,
    CHART_COLORS,
  };
}
