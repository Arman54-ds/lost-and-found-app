const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: String,
  keywords: [String],
  dateLost: Date,
  location: String,
  image: String, // file path of uploaded image
  status: {
    type: String,
    enum: ['pending', 'matched', 'returned'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LostItem', lostItemSchema);
