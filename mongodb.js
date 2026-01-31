const mongoose = require('mongoose');
const { mongoUri } = require('./settings');

async function connectDB() {
  if (!mongoUri) return;
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB error:', err);
  }
}
module.exports = connectDB;
