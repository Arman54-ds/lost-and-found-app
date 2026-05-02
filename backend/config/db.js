// MongoDB connection file
// config/db.js
const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    // useNewUrlParser/useUnifiedTopology are default in recent versions
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Exit process if DB fails — app shouldn’t run without DB
    process.exit(1);
  }
}

module.exports = connectDB;
