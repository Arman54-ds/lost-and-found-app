const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const nodemailer = require('nodemailer');

exports.getMatches = async (req, res) => {
  try {
    const matches = await FoundItem.find({ matchedWith: { $ne: null } })
      .populate({
        path: 'matchedWith',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('user','name email');

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUnmatchedItems = async (req, res) => {
  try {
    const LostItem = require('../models/LostItem');
    const FoundItem = require('../models/FoundItem');

    // All lost items that are NOT returned and NOT matched
    const lost = await LostItem.find({ status: 'pending' })
      .populate('user', 'name email');

    // All found items with no match
    const found = await FoundItem.find({ matchedWith: null })
      .populate('user', 'name email');

    res.json({ lost, found });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.approveReturn = async (req, res) => {
  try {
    const foundId = req.params.foundId;

    //  Get found item with linked lost item & student
    const foundItem = await FoundItem.findById(foundId).populate({
      path: 'matchedWith',
      populate: { path: 'user', select: 'name email' }
    });

    if (!foundItem || !foundItem.matchedWith) {
      return res.status(404).json({ message: "Matching lost item not found" });
    }

    const lostItem = foundItem.matchedWith;

    //  (OPTIONAL) Send email to student
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: lostItem.user.email,
      subject: 'Your Lost Item Has Been Returned!',
      text: `Your item "${lostItem.itemName}" has been returned successfully.`
    };

    await transporter.sendMail(mailOptions);

    //  DELETE records from DB
    await LostItem.findByIdAndDelete(lostItem._id);
    await FoundItem.findByIdAndDelete(foundId);

    return res.json({ 
      message: "Item returned successfully, email sent, data removed",
      removedLost: lostItem._id,
      removedFound: foundId
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
