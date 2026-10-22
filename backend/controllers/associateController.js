const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Associate = require('../models/Associate');
const Lead = require('../models/Lead');
const linkCtrl = require('./registrationLinkController');

const CLIENT_ID_REGEX = /^[A-Za-z0-9._-]{4,30}$/;

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
    const { clientId, password, token } = req.body;

    // 1. The shared registration link must be live and enabled.
    if (!(await linkCtrl.isValidToken(token))) {
      return res.status(403).json({ message: 'This registration link is invalid or disabled. Please contact admin.' });
    }

    // 2. Validate input.
    if (!clientId || typeof clientId !== 'string' || !CLIENT_ID_REGEX.test(clientId.trim())) {
      return res.status(400).json({ message: 'Client ID must be 4-30 characters: letters, numbers, dot, dash or underscore' });
    }
    if (!password || typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: 'Password must be 8-72 characters' });
    }

    const normalizedClientId = clientId.trim().toLowerCase();

    if (await Associate.findOne({ associateId: normalizedClientId })) {
      return res.status(409).json({ message: 'This Client ID is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // The form only collects Client ID + password. The Associate model still
    // requires name and a unique mobile, so both are filled with the Client ID
    // (already unique) - name shows up in the admin lists.
    const associate = await Associate.create({
      name: normalizedClientId,
      mobile: normalizedClientId,
      associateId: normalizedClientId,
      password: hashedPassword,
      isDefaultPassword: false,
    });

    res.status(201).json({
      message: 'Registration successful',
      clientId: associate.associateId,
      associate: sanitize(associate),
    });
  } catch (err) {
    // Two people picking the same Client ID at the same moment.
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This Client ID is already taken' });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { associateId, password } = req.body;
    if (!associateId || !password) {
      return res.status(400).json({ message: 'Client ID and password are required' });
    }

    // Client ID is stored lowercase; existing associates' IDs are their mobile
    // numbers, which are unaffected by lowercasing.
    const associate = await Associate.findOne({ associateId: String(associateId).trim().toLowerCase() });

    if (!associate || !associate.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(String(password), associate.password);
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