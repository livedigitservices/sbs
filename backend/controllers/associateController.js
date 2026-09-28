const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Associate = require('../models/Associate');
const Lead = require('../models/Lead');

const MOBILE_REGEX = /^[6-9]\d{9}$/; // Indian mobile number format

function signToken(associate) {
  return jwt.sign(
    { id: associate._id, associateId: associate.associateId, name: associate.name, role: 'associate' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitize(associate) {
  return {
    _id: associate._id,
    name: associate.name,
    mobile: associate.mobile,
    associateId: associate.associateId,
    isDefaultPassword: associate.isDefaultPassword,
  };
}

exports.register = async (req, res) => {
  try {
    const { name, mobile } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    if (!mobile || !MOBILE_REGEX.test(mobile.trim())) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
    }

    const existing = await Associate.findOne({ mobile: mobile.trim() });
    if (existing) {
      return res.status(409).json({ message: 'This mobile number is already registered' });
    }

    const hashedPassword = await bcrypt.hash(mobile.trim(), 10);

    const associate = await Associate.create({
      name: name.trim(),
      mobile: mobile.trim(),
      associateId: mobile.trim(),
      password: hashedPassword,
      isDefaultPassword: true,
    });

    res.status(201).json({
      message: 'Registration successful',
      associateId: associate.associateId,
      associate: sanitize(associate),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This mobile number is already registered' });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { associateId, password } = req.body;
    if (!associateId || !password) {
      return res.status(400).json({ message: 'Associate ID and password are required' });
    }

    const associate = await Associate.findOne({
      $or: [{ associateId: associateId.trim() }, { mobile: associateId.trim() }],
    });

    if (!associate || !associate.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, associate.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(associate);
    res.json({ token, associate: sanitize(associate) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  // Stateless JWT — client discards the token. Endpoint kept for API completeness.
  res.json({ message: 'Logged out' });
};

exports.getProfile = async (req, res) => {
  try {
    const associate = await Associate.findById(req.associate.id);
    if (!associate) return res.status(404).json({ message: 'Associate not found' });
    res.json(sanitize(associate));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const associateFilter = { associate: req.associate.id };

    const [total, newCount, inProgress, converted, rejected, recentLeads] = await Promise.all([
      Lead.countDocuments(associateFilter),
      Lead.countDocuments({ ...associateFilter, status: 'new' }),
      Lead.countDocuments({ ...associateFilter, status: 'in_progress' }),
      Lead.countDocuments({ ...associateFilter, status: 'converted' }),
      Lead.countDocuments({ ...associateFilter, status: 'rejected' }),
      Lead.find(associateFilter).sort({ createdAt: -1 }).limit(8),
    ]);

    res.json({ total, new: newCount, inProgress, converted, rejected, recentLeads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};