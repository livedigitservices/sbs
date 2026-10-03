const mongoose = require('mongoose');

// Admin-managed directory shown on the public "Find your Online Tutor /
// Trainer / Teacher / Coach / Mentor / Advisor / Counsellor" page. Each
// entry is one listing; only isActive listings are ever returned to public
// visitors. Subjects/Levels/Languages are arrays so the public page can
// offer them as filter dropdowns.
const tutorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  imageUrl: { type: String, default: '' },
  subjects: { type: [String], default: [], set: arr => (arr || []).map(s => s.trim()).filter(Boolean) },
  levels: { type: [String], default: [], set: arr => (arr || []).map(s => s.trim()).filter(Boolean) },
  languages: { type: [String], default: [], set: arr => (arr || []).map(s => s.trim()).filter(Boolean) },
  profileInfo: { type: String, trim: true, default: '' }, // "Profile / More Info"
  contactPhone: { type: String, trim: true, default: '' },
  contactEmail: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true },
  // Set when an associate adds the listing; null for admin-added (or older) listings.
  createdByAssociate: { type: mongoose.Schema.Types.ObjectId, ref: 'Associate', default: null },
  // Lower numbers show first; ties fall back to newest first.
  order: { type: Number, default: 0 },
}, { timestamps: true });

tutorSchema.index({ isActive: 1, order: 1, createdAt: -1 });
tutorSchema.index({ createdByAssociate: 1 });
tutorSchema.index({ subjects: 1 });
tutorSchema.index({ levels: 1 });
tutorSchema.index({ languages: 1 });

module.exports = mongoose.model('Tutor', tutorSchema);