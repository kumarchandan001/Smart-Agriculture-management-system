// server.js (Clean Minimal Version)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// --------------------------------------------
// Express App Setup
// --------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalize double /api/api prefixes if sent by misconfigured clients
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace('/api/api/', '/api/');
  }
  next();
});

// --------------------------------------------
// Load Required Core Services
// --------------------------------------------
try {
  const regionService = require('./services/regionSoil.service');
  if (regionService?.loadRegionCSV) regionService.loadRegionCSV();
  console.log("Region service loaded");
} catch (err) {
  console.log("Region service missing:", err.message);
}

try {
  const cropService = require('./services/cropRecommend.service');
  if (cropService?.loadCropCSV) cropService.loadCropCSV();
  console.log("Crop service loaded");
} catch (err) {
  console.log("Crop service missing:", err.message);
}

// Initialize Soil Service
try {
  const soilService = require('./services/soil.service');
  soilService.initialize().then(() => {
    console.log("✓ Soil service initialized - CSV data loaded");
  }).catch(err => {
    console.log("⚠ Soil service initialization warning:", err.message);
  });
} catch (err) {
  console.log("Soil service missing:", err.message);
}

// Note: Pest Service will be initialized after MongoDB connection
// See startServer() function below

// --------------------------------------------
// Load Required API Routes
// --------------------------------------------
try {
  const soilRouter = require('./routes/soil');
  app.use('/api/soil', soilRouter);
} catch (err) {
  console.error("Soil route failed to load:", err.message);
}

try {
  const cropsRouter = require('./routes/crops');
  app.use('/api/crops', cropsRouter);
} catch (err) {
  console.error("Crops route failed to load:", err.message);
}

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);
const predictRouter = require('./routes/predictions');
app.use('/api/predict', predictRouter);
// Market router (proxies market price API)
try {
  const marketRouter = require('./routes/market');
  app.use('/api/market', marketRouter);
} catch {
  console.log("Market route missing");
}

// Fertilizer guide router
try {
  const fertilizerRouter = require('./routes/fertilizer');
  app.use('/api/fertilizer', fertilizerRouter);
  console.log("Fertilizer guide service loaded");
} catch (err) {
  console.error("Fertilizer route failed to load:", err.message);
}

// Expense tracker router
const authMiddleware = require('./middleware/auth.middleware');
try {
  const expenseRouter = require('./routes/expenses');
  app.use('/api/expenses', authMiddleware, expenseRouter);
  console.log("Expense tracker service loaded");
} catch (err) {
  console.error("Expense route failed to load:", err.message);
}

// Pest & Disease Management router
try {
  const pestRouter = require('./routes/pests');
  app.use('/api/pests', pestRouter);
  console.log("Pest management service loaded");
} catch (err) {
  console.error("Pest route failed to load:", err.message);
}

// Knowledge Hub router
try {
  const knowledgeRouter = require('./routes/knowledge');
  app.use('/api/knowledge', knowledgeRouter);
  console.log("Knowledge hub service loaded");
} catch (err) {
  console.error("Knowledge route failed to load:", err.message);
}

// --------------------------------------------
// Health & Root Routes
// --------------------------------------------
app.get('/', (req, res) => {
  res.json({ message: "Smart Agriculture Backend Running" });
});

app.get('/health', (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// --------------------------------------------
// Error Handler
// --------------------------------------------
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// --------------------------------------------
// MongoDB Connection & Start Server
// --------------------------------------------
const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  const MONGO_URI = process.env.MONGO_URI;

  if (MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("MongoDB connected");

      // Initialize Pest Service after MongoDB is connected
      try {
        const pestService = require('./services/pest.service');
        await pestService.initialize();
        console.log("✓ Pest service initialized - Catalog loaded");
      } catch (err) {
        console.log("⚠ Pest service initialization warning:", err.message);
      }
    } catch (err) {
      console.log("MongoDB connection failed:", err.message);
    }
  } else {
    console.log("MONGO_URI missing — skipping DB connection");
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
