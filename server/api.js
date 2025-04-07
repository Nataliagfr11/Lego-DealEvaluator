// --------------------
// Dépendances
// --------------------
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

// --------------------
//  Configuration
// --------------------
const PORT = 8093;
const DB_NAME = 'lego';
const MONGO_URI = 'mongodb+srv://ngerardfr:Test1234@cluster0.snspe0p.mongodb.net/lego?retryWrites=true&w=majority';

const app = express();

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

// --------------------
// Base de données
// --------------------
let db = null;

// Connexion à MongoDB
async function initMongo() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connexion à MongoDB établie');
}

// Fermeture propre de MongoDB
async function shutdownMongo() {
  if (db) {
    await db.client?.close?.();
    console.log(' Connexion MongoDB fermée');
  }
}

// --------------------
// API Routes
// --------------------

// ➤ Route de test
app.get('/', (req, res) => {
  res.json({ ack: true });
});

// ➤ Rechercher des deals avec filtres dynamiques
app.get('/deals/search', async (req, res) => {
  const { limit = 30, page = 1, price, date, filterBy } = req.query;
  const filters = {};
  const options = {};
  const skip = (parseInt(page) - 1) * parseInt(limit);

  if (price) {
    filters.price = { $lte: parseFloat(price) };
  }

  if (date) {
    try {
      const d = new Date(date);
      const regexDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      filters.post_date = { $regex: `^${regexDate}` };
    } catch {
      console.warn('⚠️ Format de date invalide');
    }
  }

  const sortOptions = {
    'best-discount': { discount: -1 },
    'most-commented': { nb_comments: -1 },
    'hot-deals': { temperature: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'date-asc': { post_date: 1 },
    'date-desc': { post_date: -1 },
  };

  const sort = sortOptions[filterBy] || {};

  try {
    const collection = db.collection('deals');
    const total = await collection.countDocuments(filters);
    const results = await collection.find(filters).sort(sort).skip(skip).limit(parseInt(limit)).toArray();

    res.json({
      limit: parseInt(limit),
      page: parseInt(page),
      total,
      results,
    });
  } catch (err) {
    console.error('Erreur /deals/search :', err);
    res.status(500).json({ error: 'Erreur interne serveur' });
  }
});

// ➤ Rechercher des ventes (sales) selon l’identifiant du set
app.get('/sales/search', async (req, res) => {
  const { limit = 12, legoSetId } = req.query;
  const filters = legoSetId ? { lego_id: legoSetId } : {};

  try {
    const results = await db.collection('sales')
      .find(filters)
      .sort({ published_time: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({
      limit: parseInt(limit),
      total: results.length,
      results,
    });
  } catch (err) {
    console.error('Erreur /sales/search :', err);
    res.status(500).json({ error: 'Erreur interne serveur' });
  }
});

// ➤ Récupération d’un deal spécifique par ID
app.get('/deals/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deal = await db.collection('deals').findOne({ legoId: id });

    if (!deal) {
      return res.status(404).json({ error: 'Deal introuvable' });
    }

    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ➤ Liste des favoris
app.get('/favorites', async (req, res) => {
  try {
    const favorites = await db.collection('favorites').find({}).toArray();
    res.json({ favorites: favorites.map(f => f.legoId) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des favoris' });
  }
});

// ➤ Ajouter / retirer un favori
app.post('/favorites/toggle', async (req, res) => {
  const { legoId } = req.body;

  if (!legoId) {
    return res.status(400).json({ error: 'legoId est requis' });
  }

  try {
    const fav = await db.collection('favorites').findOne({ legoId });

    if (fav) {
      await db.collection('favorites').deleteOne({ legoId });
      return res.json({ message: 'Retiré des favoris' });
    } else {
      await db.collection('favorites').insertOne({ legoId });
      return res.json({ message: 'Ajouté aux favoris' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ➤ Statistiques sur les ventes d’un set
app.get('/sales/indicators', async (req, res) => {
  const { legoSetId } = req.query;

  if (!legoSetId) {
    return res.status(400).json({ error: 'legoSetId requis' });
  }

  try {
    const raw = await db.collection('sales').find({
      lego_id: legoSetId,
      'price.amount': { $ne: null }
    }).toArray();

    if (raw.length === 0) {
      return res.json({ count: 0, p5: 0, p25: 0, p50: 0, lifetimeDays: 0 });
    }

    const parseDate = str => {
      const [d, t = '00:00:00'] = str.split(' ');
      const [day, month, year] = d.split('/');
      return new Date(`${year}-${month}-${day}T${t}`);
    };

    const sales = raw
      .map(s => ({
        price: parseFloat(s.price?.amount || 0),
        published: parseDate(s.published_time)
      }))
      .filter(s => !isNaN(s.price) && !isNaN(s.published.getTime()))
      .sort((a, b) => a.published - b.published);

    const prices = sales.map(s => s.price);
    const getPercentile = (arr, p) => arr[Math.floor(p * arr.length)] || 0;
    const count = prices.length;
    const lifetimeDays = Math.floor((sales.at(-1).published - sales[0].published) / (1000 * 60 * 60 * 24));

    res.json({
      count,
      p5: getPercentile(prices, 0.05),
      p25: getPercentile(prices, 0.25),
      p50: getPercentile(prices, 0.5),
      lifetimeDays
    });
  } catch (err) {
    console.error('Erreur /sales/indicators :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --------------------
// Démarrage du serveur
// --------------------
initMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur disponible sur http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Échec de la connexion MongoDB', err);
  process.exit(1);
});

// --------------------
// Fermeture propre
// --------------------
process.on('SIGINT', async () => {
  await shutdownMongo();
  process.exit(0);
});
