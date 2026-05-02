const LostItem = require('../models/LostItem');

exports.addLostItem = async (req, res) => {
  try {
    const { itemName, category, description, keywords, dateLost, location } = req.body;

    const newItem = new LostItem({
      user: req.user.id, // comes from JWT middleware
      itemName,
      category,
      description,
      keywords: keywords ? keywords.split(',') : [],
      dateLost,
      location,
      image: req.file ? req.file.filename : null
    });

    await newItem.save();

    res.status(201).json({ message: 'Lost item submitted successfully', data: newItem });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
