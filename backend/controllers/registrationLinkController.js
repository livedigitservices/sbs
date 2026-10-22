const crypto = require('crypto');
const RegistrationLink = require('../models/RegistrationLink');

const KEY = 'associate-registration';
const newToken = () => crypto.randomBytes(32).toString('hex');

const toJSON = (link) => ({
  token: link.token,
  isActive: link.isActive,
  createdAt: link.createdAt,
  updatedAt: link.updatedAt,
});

// Returns the single link, creating it on first use. Safe if two requests race.
async function getOrCreate() {
  try {
    return await RegistrationLink.findOneAndUpdate(
      { key: KEY },
      { $setOnInsert: { token: newToken(), isActive: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    if (err.code === 11000) return RegistrationLink.findOne({ key: KEY });
    throw err;
  }
}

// Admin: get the permanent link (auto-created the first time).
exports.getLink = async (req, res) => {
  try {
    res.json(toJSON(await getOrCreate()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: replace the token. The old URL stops working immediately.
exports.regenerateLink = async (req, res) => {
  try {
    await getOrCreate();
    const link = await RegistrationLink.findOneAndUpdate(
      { key: KEY },
      { token: newToken(), isActive: true },
      { new: true }
    );
    res.json(toJSON(link));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: switch registration on/off without changing the URL.
exports.setActive = async (req, res) => {
  try {
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be true or false' });
    }
    await getOrCreate();
    const link = await RegistrationLink.findOneAndUpdate(
      { key: KEY },
      { isActive: req.body.isActive },
      { new: true }
    );
    res.json(toJSON(link));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Shared helper (also used by registration): is this token the live, enabled link?
exports.isValidToken = async (token) => {
  if (!token || typeof token !== 'string') return false;
  const link = await RegistrationLink.findOne({ key: KEY, token, isActive: true }).select('_id');
  return !!link;
};

// Public: does this token open the registration form?
exports.validateLink = async (req, res) => {
  try {
    if (await exports.isValidToken(req.params.token)) return res.json({ valid: true });
    res.status(404).json({ valid: false });
  } catch (err) {
    res.status(404).json({ valid: false });
  }
};