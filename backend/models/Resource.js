const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  // `title` and `category` are legacy, optional fields. New media is added
  // without them; older records keep whatever they already had.
  title: { type: String, trim: true, default: '' },
  category: { type: String, trim: true, default: '' },
  type: { type: String, enum: ['image', 'video', 'link'], required: true },
  url: { type: String, required: true },
  // Only used when type === 'link' (e.g. YouTube, Instagram, Facebook, WhatsApp)
  platform: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Media is always listed newest-first.
resourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resource', resourceSchema);