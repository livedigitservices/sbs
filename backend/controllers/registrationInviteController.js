const crypto = require('crypto');
const RegistrationInvite = require('../models/RegistrationInvite');

const INVITE_VALID_DAYS = 7;

const statusOf = (inv) => {
  if (inv.isRevoked) return 'revoked';
  if (inv.usedAt) return 'used';
  if (inv.expiresAt <= new Date()) return 'expired';
  return 'active';
};

// Admin: create a new single-use link.
exports.createInvite = async (req, res) => {
  try {
    const label = (req.body.label || '').toString().trim().slice(0, 80);
    const invite = await RegistrationInvite.create({
      token: crypto.randomBytes(32).toString('hex'),
      label,
      expiresAt: new Date(Date.now() + INVITE_VALID_DAYS * 24 * 60 * 60 * 1000),
    });
    res.status(201).json({ ...invite.toObject(), status: statusOf(invite) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: list links, newest first.
exports.listInvites = async (req, res) => {
  try {
    const invites = await RegistrationInvite.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('usedBy', 'name associateId');
    res.json(invites.map(i => ({ ...i.toObject(), status: statusOf(i) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: revoke a link that hasn't been used yet.
exports.revokeInvite = async (req, res) => {
  try {
    const invite = await RegistrationInvite.findById(req.params.id);
    if (!invite) return res.status(404).json({ message: 'Link not found' });
    if (invite.usedAt) return res.status(400).json({ message: 'This link has already been used' });
    invite.isRevoked = true;
    await invite.save();
    res.json({ ...invite.toObject(), status: statusOf(invite) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Public: does this token open the registration form? Deliberately returns
// the same generic 404 for unknown / used / expired / revoked tokens.
exports.validateInvite = async (req, res) => {
  try {
    const invite = await RegistrationInvite.findOne({ token: req.params.token });
    if (!invite || statusOf(invite) !== 'active') {
      return res.status(404).json({ valid: false });
    }
    res.json({ valid: true });
  } catch (err) {
    res.status(404).json({ valid: false });
  }
};