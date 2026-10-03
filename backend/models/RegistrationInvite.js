const mongoose = require('mongoose');

// One admin-generated, single-use registration link. The random `token` is
// the only thing in the URL; it is checked on the backend both when the
// registration page loads and again when the form is submitted.
const registrationInviteSchema = new mongoose.Schema({
  token:     { type: String, required: true, unique: true, index: true },
  label:     { type: String, trim: true, default: '' }, // optional note for the admin, e.g. who the link is for
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  usedAt:    { type: Date, default: null },
  usedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'Associate', default: null },
}, { timestamps: true });

module.exports = mongoose.model('RegistrationInvite', registrationInviteSchema);