const mongoose = require('mongoose');

// Admin-managed "What's New" items shown on the public home page.
const noticeSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 300 },
  // Internal path (e.g. /tutors) or full URL. Empty = default destination on the client.
  link: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true },
  // Lower numbers show first; ties fall back to newest first.
  order: { type: Number, default: 0 },
}, { timestamps: true });

noticeSchema.index({ isActive: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);