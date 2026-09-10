const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const Problem = require('./models/Problem');
const seedProblems = require('./domain/problems/seedData');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lld_platform';

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    dbState: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Connect to MongoDB and start server
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully at', MONGO_URI);

    // Check and seed initial problems if empty
    const count = await Problem.countDocuments();
    if (count === 0) {
      console.log('Seeding initial problems...');
      for (const prob of seedProblems) {
        await Problem.create(prob);
      }
      console.log('Seeding complete.');
    }

    app.listen(PORT, () => {
      console.log(`LLD Backend Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
