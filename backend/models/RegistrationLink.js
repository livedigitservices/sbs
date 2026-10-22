const mongoose = require('mongoose');

// The ONE permanent, shared associate-registration link. There is only ever a
// single document (enforced by the unique `key`). Its `token` is the only thing
// in the URL; admins can disable it or regenerate the token if it ever leaks.
const registrationLinkSchema = new mongoose.Schema({
  key:      { type: String, default: 'associate-registration', unique: true, immutable: true },
  token:    { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('RegistrationLink', registrationLinkSchema);