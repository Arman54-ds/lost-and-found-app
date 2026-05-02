const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getMatches, approveReturn } = require('../controllers/adminController');
const { getUnmatchedItems } = require('../controllers/adminController');

// Only admin can access
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Access denied' });
  next();
}

router.get('/matches', verifyToken, isAdmin, getMatches);
router.get('/unmatched', verifyToken, isAdmin, getUnmatchedItems);
router.put('/approve/:foundId', verifyToken, isAdmin, approveReturn);

module.exports = router;
