const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object[]} deal list
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('div.prods a')
    .map((i, element) => {
      const priceText = $(element).find('span.prodl-prix span').text().trim().replace(',', '.');
      const discountText = $(element).find('span.prodl-reduc').text().trim().replace('-', '').replace('%', '');
      const href = $(element).attr('href');

      return {
        title: $(element).attr('title'),
        price: parseFloat(priceText),
        discount: parseInt(discountText),
        link: href.startsWith('http') ? href : `https://www.avenuedelabrique.com${href}`
      };
    })
    .get();
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns {Promise<Object[]>}
 */
module.exports.scrape = async url => {
  const response = await fetch(url);

  if (response.ok) {
    const body = await response.text();
    return parse(body);
  }

  console.error("Erreur lors de la requête :", response.status);
  return [];
};
