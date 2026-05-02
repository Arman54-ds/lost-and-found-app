const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const verifyToken = require('../middleware/authMiddleware');
const { addFoundItem } = require('../controllers/foundItemController');
const FoundItem = require('../models/FoundItem');

router.get('/my', verifyToken, async (req, res) => {
  try {
    const items = await FoundItem.find({ user: req.user.id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/', verifyToken, upload.single('image'), addFoundItem);

module.exports = router;
