const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ngerardfr:Test1234@cluster0.snspe0p.mongodb.net/lego?retryWrites=true&w=majority';

const DB_NAME = 'lego';
const COLLECTION_DEALS = 'deals';
const COLLECTION_SALES = 'sales';

const fs = require('fs');
const path = require('path');

async function insertDealsFromFile() {
    const db = await connectToDB();
    const collection = db.collection(COLLECTION_DEALS);


// Supprime tous les anciens documents
await collection.deleteMany({});
  
    const dealsPath = path.join(__dirname, 'deals.json');
    const rawData = fs.readFileSync(dealsPath, 'utf-8');
    const deals = JSON.parse(rawData);
  
    const result = await collection.insertMany(deals);
    console.log(`🧱 ${result.insertedCount} deals insérés dans MongoDB (après nettoyage) !`);
  }  

  async function insertSalesFromFile() {
    const db = await connectToDB();
    const collection = db.collection(COLLECTION_SALES);
  
    await collection.deleteMany({});
    const salesPath = path.join(__dirname, 'vintedtotal.json');
    const rawData = fs.readFileSync(salesPath, 'utf-8');
    let sales = JSON.parse(rawData);
  
    // Ajout du champ lego_id s’il est manquant
    sales = sales.map(sale => {
      if (!sale.lego_id) {
        const match = sale.title.match(/\b(10\d{3}|75\d{3}|21\d{3})\b/);
        if (match) sale.lego_id = match[0];
      }
      return sale;
    });
  
    const result = await collection.insertMany(sales);
    console.log(`📦 ${result.insertedCount} sales insérées dans MongoDB (après nettoyage) !`);
  }


/**
 * Connection to MongoDB
 */
async function connectToDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db(DB_NAME);
}

/**
 * Find the best deals
 */
async function findBestDiscountDeals() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  return await collection.find({ discount: { $ne: null } }).sort({ discount: -1 }).toArray();
}

/**
 * Find the most commented deals
 */
async function findMostCommentedDeals() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  return await collection.find().sort({ nb_comments: -1 }).toArray();
}

/**
 * Sort deals by price 
 */
async function findDealsSortedByPrice() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  return await collection.find().sort({ price: 1 }).toArray();
}

/**
 * Find all deals sorted by dates 
 */
async function findDealsSortedByDate() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_DEALS);
  return await collection.find().sort({ _id: -1 }).toArray();
}

/**
 * Find all sales for a given lego set id 
 */
async function findSalesByLegoSetId(legoSetId) {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_SALES);
  
  return await collection.find({ lego_id: legoSetId }).toArray();
}


/**
 * Find all sales scraped less than 3 weeks 
 */
async function findRecentSales() {
  const db = await connectToDB();
  const collection = db.collection(COLLECTION_SALES);

  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

  return await collection.find({
    $expr: {
      $gte: [
        { $dateFromString: { dateString: "$published_time", format: "%d/%m/%Y %H:%M:%S" } },
        threeWeeksAgo
      ]
    }
  }).toArray();
}
/**
 * Exécute les requêtes et affiche les résultats
 */
async function runQueries() {
  await insertDealsFromFile();
  await insertSalesFromFile();
  console.log('Best Discount Deals:', await findBestDiscountDeals());
  //console.log('Most Commented Deals:', await findMostCommentedDeals());
  //console.log('Deals Sorted by Price:', await findDealsSortedByPrice());
  //console.log('Deals Sorted by Date:', await findDealsSortedByDate());
  //console.log('Sales for LEGO ID 75403:', await findSalesByLegoSetId('75403'));
  //console.log('Recent Sales:', await findRecentSales());
}

// Exécuter les requêtes
runQueries();