// backend/controllers/foundItemController.js
const FoundItem = require('../models/FoundItem');
const LostItem = require('../models/LostItem');
const calculateMatchScore = require('../utils/matchHelper');

exports.addFoundItem = async (req, res) => {
  try {
    const { category, description, keywords, dateFound, location } = req.body;

    const newItem = new FoundItem({
      user: req.user.id,
      category,
      description,
      keywords: keywords ? keywords.split(',') : [],
      dateFound,
      location,
      image: req.file ? req.file.filename : null
    });

    await newItem.save();

    // ✅ AUTO-MATCH LOGIC STARTS ✨
    const lostItems = await LostItem.find({ category }); // same category filter

    let bestMatch = null;
    let bestScore = 0;

    for (let lost of lostItems) {
      const score = calculateMatchScore(lost, newItem);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = lost;
      }
    }

    if (bestMatch && bestScore >= 30) {
      newItem.matchedWith = bestMatch._id;
      newItem.matchScore = bestScore;
      await newItem.save();

      bestMatch.status = 'matched';
      await bestMatch.save();
    }

    // ✅ SEND FINAL RESPONSE
    res.status(201).json({
      message: 'Found item submitted',
      autoMatched: bestMatch ? true : false,
      matchScore: bestScore,
      matchedWith: bestMatch,
      data: newItem
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
