const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: String,
  keywords: [String],
  dateFound: Date,
  location: String,
  image: String,              // uploaded file name
  matchedWith: {              // reference to LostItem if matched
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem',
    default: null
  },
  matchScore: Number,         // how well it matches
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FoundItem', foundItemSchema);
