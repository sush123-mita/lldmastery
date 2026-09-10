const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const seedProblems = require('../domain/problems/seedData');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lld_platform';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    for (const prob of seedProblems) {
      await Problem.findOneAndUpdate(
        { slug: prob.slug },
        prob,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Seeded problem: ${prob.title}`);
    }

    console.log('Successfully seeded all problems!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
