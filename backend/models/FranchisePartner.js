const mongoose = require('mongoose');

// A franchise person inside a state card: just a name and mobile number(s).
const personSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  phones: {
    type: [String],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'Add at least one mobile number for every person',
    },
  },
  phone:  String, // legacy single-number field (old records only)
}, { _id: false });

const franchisePartnerSchema = new mongoose.Schema({
  state:   { type: String, required: true, trim: true },
  order:   { type: Number, default: 0 },
  // Array order IS display order: index 0 (top) = newest person.
  persons: [personSchema],
}, { timestamps: true });

module.exports = mongoose.model('FranchisePartner', franchisePartnerSchema);