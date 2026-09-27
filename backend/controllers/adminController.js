const jwt = require('jsonwebtoken');
const Associate = require('../models/Associate');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalAssociates, activeAssociates] = await Promise.all([
      Associate.countDocuments(),
      Associate.countDocuments({ isActive: true }),
    ]);

    res.json({ totalAssociates, activeAssociates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAssociates = async (req, res) => {
  try {
    const associates = await Associate.find().sort({ createdAt: -1 }).select('-password');
    res.json(associates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleAssociateActive = async (req, res) => {
  try {
    const associate = await Associate.findById(req.params.id);
    if (!associate) return res.status(404).json({ message: 'Associate not found' });
    associate.isActive = !associate.isActive;
    await associate.save();
    res.json({ isActive: associate.isActive });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};