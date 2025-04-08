// Invoking strict mode
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
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
//const fetchDeals = async (page = 1, size = 6) => {
  //try {
    //const response = await fetch(
      //`https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    //);
    //const body = await response.json();

    //if (body.success !== true) {
     // console.error("Deals API error:", body);
      //return {currentDeals, currentPagination};
    //}

    //return body.data; // { result: [...], meta: {...} }
  //} catch (error) {
    //console.error("Deals API fetch error:", error);
    //return {currentDeals, currentPagination};
  //}
//};

const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://server-rho-weld-18.vercel.app/deals/search?page=${page}&limit=${size}`
    );
    const body = await response.json();

    // On construit l'objet attendu pour le front (result + meta)
    const result = body.results || [];
    const meta = {
      count: body.total || 0,
      currentPage: body.page || 1,
      pageCount: Math.ceil((body.total || 1) / size)
    };

    return { result, meta };
  } catch (error) {
    console.error("Deals API fetch error:", error);
    return { result: [], meta: {} };
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = (deals) => {
  const fragment = document.createDocumentFragment();
  const template = deals.map(deal => {
    const isFavorite = isDealFavorite(deal.legoId);
    const imageHtml = deal.image
      ? `<img src="${deal.image}" alt="Image du set LEGO" class="deal-image">`
      : `<div class="no-image">No image</div>`;

    return `
      <div class="deal-card" id="${deal.legoId}">
        ${imageHtml}
        <p><strong>${deal.legoId}</strong></p>
        <a href="${deal.link}" target="_blank">${deal.title}</a>
        <p><strong>${deal.price} €</strong></p>
        <p>🔥 Discount: <strong>${deal.discount}%</strong></p>
        <p>💬 Comments: <strong>${deal.nb_comments ?? 0}</strong></p>
        <p>🗓️ Published: <strong>${deal.post_date}</strong></p>
        <button onclick="toggleFavorite('${deal.legoId}')">
          ${isFavorite ? '💛' : '🤍'}
        </button>
      </div>
    `;
  }).join('');

  sectionDeals.innerHTML = `
    <h2>Deals</h2>
    <div class="deal-grid">
      ${template}
    </div>
  `;
};



/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  // Indice du select = currentPage - 1 (puisqu’on commence à 1, pas 0)
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} deals - list of lego deals
 */
const renderLegoSetIds = deals => {
  // getIdsFromDeals(deals) vient de utils.js
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;

  // Déclenche manuellement "change" pour afficher les ventes Vinted du 1er ID
  // (sinon, il faut que l'utilisateur change manuellement le select)
  selectLegoSetIds.dispatchEvent(new Event('change'));
};

/**
 * Render indicators
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  spanNbDeals.innerHTML = count;
};

/**
 * Regroupe tous les rendus
 */
const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals);
};

/**
 * On écoute le changement "nombre à afficher"
 */
selectShow.addEventListener('change', async (event) => {
  const newSize = parseInt(event.target.value);
  const deals = await fetchDeals(currentPagination.currentPage, newSize);
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Au chargement de la page
 */
document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals(); // page=1, size=6
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * On écoute le changement de page
 */
selectPage.addEventListener('change', async (event) => {
  const selectedPage = parseInt(event.target.value);
  const newSize = parseInt(selectShow.value);
  const deals = await fetchDeals(selectedPage, newSize);
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Filter deals with more than 50% discount
 */
document.querySelector('#filters span:nth-child(1)').addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal => deal.discount >= 50);
  render(filteredDeals, currentPagination);
});

/**
 * Filter deals by favorite
 */
document.querySelector('#filter-favorite').addEventListener('click', () => {
  const favorites = getFavoriteDeals(); // Récupère les IDs favoris
  const favoriteDeals = currentDeals.filter(deal => favorites.includes(deal.legoId));
  render(favoriteDeals, currentPagination); // Rend uniquement les favoris
});


/**
 * Reset filters
 */
document.querySelector('#reset-filters').addEventListener('click', async () => {
  const page = currentPagination.currentPage;
  const size = parseInt(selectShow.value);
  const deals = await fetchDeals(page, size);
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Filter by most commented (more than 5 comments)
 */
document.querySelector('#filters span:nth-child(2)').addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal =>
    deal.nb_comments !== undefined && !isNaN(deal.nb_comments) && deal.nb_comments > 5
  );
  render(filteredDeals, currentPagination);
});

/**
 * Filter by temperature > 100
 */
document.querySelector('#filters span:nth-child(3)').addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal =>
    deal.temperature !== undefined && !isNaN(deal.temperature) && deal.temperature > 100
  );
  render(filteredDeals, currentPagination);
});

/**
 * Sort deals by price or date
 */
document.querySelector('#sort-select').addEventListener('change', (event) => {
  const sortOrder = event.target.value;
  let sortedDeals = [...currentDeals];

  if (sortOrder === "price-asc") {
    sortedDeals.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "price-desc") {
    sortedDeals.sort((a, b) => b.price - a.price);
  } else if (sortOrder === "date-asc") {
    sortedDeals.sort((a, b) => a.published - b.published);
  } else if (sortOrder === "date-desc") {
    sortedDeals.sort((a, b) => b.published - a.published);
  } else {
    console.warn("Unknown sorting option:", sortOrder);
  }

  render(sortedDeals, currentPagination);
});

/**
 * Fetch Vinted sales for a given Lego Set ID
 * @param {Number} setId - The selected Lego Set ID
 * @return {Array} - List of Vinted sales
 */
const fetchVintedSales = async (setId) => {
  try {
    const response = await fetch(
      `https://server-rho-weld-18.vercel.app/sales/search?legoSetId=${setId}`
    );
    const body = await response.json();

    if (!Array.isArray(body.results)) {
      console.warn("Format inattendu pour les ventes Vinted");
      return [];
    }

    return body.results.map(sale => ({
      title: sale.title,
      price: parseFloat(sale.price?.amount || 0),
      published: parsePublishedTime(sale.published_time),
      link: sale.url
    }));
  } catch (error) {
    console.error("Erreur Vinted sales:", error);
    return [];
  }
};


/**
 * Render Vinted sales in the page
 * @param {Array} sales - List of Vinted sales
 */
const renderVintedSales = (sales) => {
  const sectionSales = document.querySelector('#vinted-sales');
  sectionSales.innerHTML = "<h2>Vinted Sales</h2>";

  if (sales.length === 0) {
    sectionSales.innerHTML += "<p>No Vinted sales available for this Lego Set.</p>";
    return;
  }

  const list = document.createElement('ul');
  sales.forEach(sale => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="${sale.link}" target="_blank">Vinted Sale: ${sale.title} - ${sale.price}€</a>`;
    list.appendChild(listItem);
  });

  sectionSales.appendChild(list);
};

/**
 * Event Listener: Fetch and display Vinted sales when selecting a Lego Set ID
 */
selectLegoSetIds.addEventListener('change', async (event) => {
  const selectedSetId = event.target.value; // Récupère l'ID du set sélectionné
  console.log("Fetching Vinted sales for Set ID:", selectedSetId);

  const vintedSales = await fetchVintedSales(selectedSetId);
  renderVintedSales(vintedSales);

  updateNumberOfSales(vintedSales.length);

  const prices = vintedSales
  .map(sale => Number(sale.price))       
  .filter(price => !isNaN(price));       

  const priceStats = computePriceStatistics(prices);
  updatePriceIndicators(priceStats);
  updateLifetimeValue(vintedSales);
});


/**
 * Compute stats p5, p25, p50
 */
const computePriceStatistics = (prices) => {
  if (prices.length === 0) {
    return { average: 0, p5: 0, p25: 0, p50: 0 };
  }

  prices.sort((a, b) => a - b);
  const average = (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2);

  const getPercentile = (percentile) => {
    const index = Math.floor((percentile / 100) * prices.length);
    return prices[Math.min(index, prices.length - 1)];
  };

  return {
    average,
    p5: getPercentile(5),
    p25: getPercentile(25),
    p50: getPercentile(50),
  };
};

/**
 * Update price indicators in the DOM
 */
const updatePriceIndicators = (stats) => {
  document.querySelector('#avgPrice').textContent = stats.average;
  document.querySelector('#p5Price').textContent = stats.p5;
  document.querySelector('#p25Price').textContent = stats.p25;
  document.querySelector('#p50Price').textContent = stats.p50;
};

/**
 * Update the lifetime value in days from sales data
 */
const updateLifetimeValue = (sales) => {
  if (!sales || sales.length === 0) {
    document.querySelector('#lifetime').textContent = "0 days";
    return;
  }

  // Convertir les dates "Thu, 16 Jan 2025 20:47:58 GMT" en timestamp
  const timestamps = sales
  .map(sale => {
    const d = parsePublishedTime(sale.published);
    return d ? d.getTime() : NaN;
  })  
    .filter(ts => !isNaN(ts))
    .sort((a, b) => a - b);

  if (timestamps.length < 2) {
    document.querySelector('#lifetime').textContent = "1 day";
    return;
  }

  const first = timestamps[0];
  const last = timestamps[timestamps.length - 1];
  const days = Math.max(1, Math.round((last - first) / (1000 * 60 * 60 * 24)));
  document.querySelector('#lifetime').textContent = `${days} days`;
};

const parsePublishedTime = (str) => {
  if (!str || typeof str !== 'string') return null;
  const [datePart, timePart] = str.split(' ');
  const [day, month, year] = datePart.split('/');
  const isoString = `${year}-${month}-${day}T${timePart}`;
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
};


/**
 * Update the number of sales
 */
const updateNumberOfSales = (numberOfSales) => {
  const salesIndicator = document.querySelector('#nbSales');
  salesIndicator.textContent = numberOfSales;
};


/**
 * Gérer les favoris dans le local storage
 */
const getFavoriteDeals = () => {
  return JSON.parse(localStorage.getItem('favorites')) || [];
};

const saveFavoriteDeals = (favorites) => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

const isDealFavorite = (dealId) => {
  const favorites = getFavoriteDeals();
  return favorites.includes(dealId);
};

const toggleFavorite = (dealId) => {
  let favorites = getFavoriteDeals();
  if (favorites.includes(dealId)) {
    favorites = favorites.filter(id => id !== dealId);
  } else {
    favorites.push(dealId);
  }
  saveFavoriteDeals(favorites);

  // Recharge l'affichage avec les favoris mis à jour
  render(currentDeals, currentPagination);
};

