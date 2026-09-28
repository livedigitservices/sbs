const jwt = require('jsonwebtoken');
const Associate = require('../models/Associate');
const Lead = require('../models/Lead');

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalAssociates, activeAssociates, totalLeads, todayLeads, recentLeads] = await Promise.all([
      Associate.countDocuments(),
      Associate.countDocuments({ isActive: true }),
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: today } }),
      Lead.find().sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({ totalAssociates, activeAssociates, totalLeads, todayLeads, recentLeads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAssociates = async (req, res) => {
  try {
    const associates = await Associate.find().sort({ createdAt: -1 }).select('-password');
    const leadCounts = await Lead.aggregate([
      { $group: { _id: '$associate', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(leadCounts.map(c => [String(c._id), c.count]));
    const result = associates.map(a => ({ ...a.toObject(), leadCount: countMap[String(a._id)] || 0 }));
    res.json(result);
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