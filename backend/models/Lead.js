const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  associate:     { type: mongoose.Schema.Types.ObjectId, ref: 'Associate', required: true },
  associateName: { type: String, required: true },
  clientName:    { type: String, required: true, trim: true },
  mobile:        { type: String, required: true, trim: true },
  leadFor:       { type: String, required: true, trim: true },
  status:        { type: String, enum: ['new', 'in_progress', 'converted', 'rejected'], default: 'new' },
}, { timestamps: true });

leadSchema.index({ clientName: 'text', leadFor: 'text', mobile: 'text' });

module.exports = mongoose.model('Lead', leadSchema);