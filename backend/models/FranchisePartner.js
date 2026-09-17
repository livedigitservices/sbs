const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  phone: { type: String, required: true },
}, { _id: false });

const franchisePartnerSchema = new mongoose.Schema({
  state:   { type: String, required: true },
  order:   { type: Number, default: 0 },
  areas:   [{ type: String, required: true }],   // pincodes / locality names, e.g. "508001", "Nalgonda"
  persons: [personSchema],                        // franchise contact person(s) for this state
}, { timestamps: true });

module.exports = mongoose.model('FranchisePartner', franchisePartnerSchema);