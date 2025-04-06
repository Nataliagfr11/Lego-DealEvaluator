// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
// Global variables
let currentDeals = [];
let currentPagination = {};

// DOM Selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals = document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const spanNbSales = document.querySelector('#nbSales');
const spanP5 = document.querySelector('#p5Price');
const spanP25 = document.querySelector('#p25Price');
const spanP50 = document.querySelector('#p50Price');
const spanLifetime = document.querySelector('#lifetime');

// Utilities
const getIdsFromDeals = (deals) => [...new Set(deals.map(d => d.id))];

const computePriceStatistics = (prices) => {
  if (!prices.length) return { average: 0, p5: 0, p25: 0, p50: 0 };
  prices.sort((a, b) => a - b);
  const getPercentile = (p) => prices[Math.floor((p / 100) * prices.length)];
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  return {
    average: average.toFixed(2),
    p5: getPercentile(5).toFixed(2),
    p25: getPercentile(25).toFixed(2),
    p50: getPercentile(50).toFixed(2)
  };
};

// API calls
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const res = await fetch(`https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`);
    const body = await res.json();
    return body.success ? body.data : { result: [], meta: {} };
  } catch (e) {
    console.error(e);
    return { result: [], meta: {} };
  }
};

const fetchVintedSales = async (setId) => {
  try {
    const res = await fetch(`https://lego-api-blue.vercel.app/sales?id=${setId}`);
    const body = await res.json();
    return body.success ? body.data.result || [] : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

// Render Deals - Feature 0
const renderDeals = (deals) => {
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  const template = deals.map(deal => `
    <div class="deal" id="${deal.uuid}">
      <span>${deal.id}</span>
      <a href="${deal.link}" target="_blank">${deal.title}</a>
      <span>${deal.price}€</span>
    </div>`).join('');
  sectionDeals.insertAdjacentHTML('beforeend', template);
};

// Render Pagination - Feature 1
const renderPagination = ({ currentPage, pageCount }) => {
  selectPage.innerHTML = Array.from({ length: pageCount }, (_, i) =>
    `<option value="${i + 1}">${i + 1}</option>`).join('');
  selectPage.selectedIndex = currentPage - 1;
};

// Render Set IDs Dropdown
const renderLegoSetIds = (deals) => {
  const options = getIdsFromDeals(deals).map(id =>
    `<option value="${id}">${id}</option>`).join('');
  selectLegoSetIds.innerHTML = options;
};

// Render Indicators - Feature 8
const renderIndicators = ({ count }) => {
  spanNbDeals.textContent = count;
};

// Update number of sales - Feature 8
const updateNumberOfSales = (n) => {
  spanNbSales.textContent = n;
};

// Update price indicators - Feature 9
const updatePriceIndicators = (stats) => {
  spanP5.textContent = stats.p5;
  spanP25.textContent = stats.p25;
  spanP50.textContent = stats.p50;
};

// Update lifetime value - Feature 10
const updateLifetimeValue = (sales) => {
  if (!sales.length) {
    spanLifetime.textContent = '0 days';
    return;
  }
  const times = sales.map(s => s.published).filter(ts => typeof ts === 'number').sort((a, b) => a - b);
  const days = Math.round((times[times.length - 1] - times[0]) / (3600 * 24));
  spanLifetime.textContent = `${days} days`;
};

// Render Vinted Sales - Feature 7
const renderVintedSales = (sales) => {
  const section = document.querySelector('#vinted-sales');
  section.innerHTML = '<h2>Vinted Sales</h2>';
  if (!sales.length) {
    section.innerHTML += '<p>No Vinted sales available for this Lego Set.</p>';
    return;
  }
  const list = document.createElement('ul');
  sales.forEach(s => {
    const item = document.createElement('li');
    item.innerHTML = `<a href="${s.link}" target="_blank">${s.title} - ${s.price}€</a>`;
    list.appendChild(item);
  });
  section.appendChild(list);
};

// Main render function
const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals);
};

// Listeners
selectShow.addEventListener('change', async (e) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(e.target.value));
  currentDeals = deals.result;
  currentPagination = deals.meta;
  render(currentDeals, currentPagination);
});

selectPage.addEventListener('change', async (e) => {
  const deals = await fetchDeals(parseInt(e.target.value), parseInt(selectShow.value));
  currentDeals = deals.result;
  currentPagination = deals.meta;
  render(currentDeals, currentPagination);
});

document.querySelector('#filters span:nth-child(1)').addEventListener('click', () => {
  const filtered = currentDeals.filter(d => d.discount >= 50); // Feature 2
  render(filtered, currentPagination);
});

document.querySelector('#filters span:nth-child(2)').addEventListener('click', () => {
  const filtered = currentDeals.filter(d => d.comments > 5); // Feature 3
  render(filtered, currentPagination);
});

document.querySelector('#filters span:nth-child(3)').addEventListener('click', () => {
  const filtered = currentDeals.filter(d => d.temperature > 100); // Feature 4
  render(filtered, currentPagination);
});

document.querySelector('#reset-filters').addEventListener('click', async () => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(selectShow.value));
  currentDeals = deals.result;
  currentPagination = deals.meta;
  render(currentDeals, currentPagination);
});

document.querySelector('#sort-select').addEventListener('change', (e) => {
  const sorted = [...currentDeals];
  const val = e.target.value;
  if (val === 'price-asc') sorted.sort((a, b) => a.price - b.price);       // Feature 5
  else if (val === 'price-desc') sorted.sort((a, b) => b.price - a.price); // Feature 5
  else if (val === 'date-asc') sorted.sort((a, b) => a.published - b.published); // Feature 6
  else if (val === 'date-desc') sorted.sort((a, b) => b.published - a.published); // Feature 6
  render(sorted, currentPagination);
});

selectLegoSetIds.addEventListener('change', async (e) => {
  const sales = await fetchVintedSales(e.target.value); // Feature 7
  updateNumberOfSales(sales.length); // Feature 8
  updatePriceIndicators(computePriceStatistics(sales.map(s => s.price))); // Feature 9
  updateLifetimeValue(sales); // Feature 10
  renderVintedSales(sales);
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();
  currentDeals = deals.result;
  currentPagination = deals.meta;
  render(currentDeals, currentPagination);
});
