const mongoose = require('mongoose');

// One service area of ONE person: an area name, a PIN code, or both.
const areaSchema = new mongoose.Schema({
  area:    { type: String, trim: true, default: '' },
  pincode: {
    type: String,
    trim: true,
    default: '',
    validate: {
      validator: (v) => !v || /^\d{6}$/.test(v),
      message: 'PIN code must be exactly 6 digits',
    },
  },
}, { _id: false });

areaSchema.pre('validate', function () {
  if (!this.area && !this.pincode) {
    this.invalidate('area', 'Each area needs an area name or a PIN code');
  }
});

// A franchise person inside a state card. Areas, PIN codes and mobile numbers
// live on the person, so different people never share or mix them.
const personSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  phones: {
    type: [String],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'Add at least one mobile number for every person',
    },
  },
  areas:  [areaSchema],
  phone:  String, // legacy single-number field (old records only)
}, { _id: false });

const franchisePartnerSchema = new mongoose.Schema({
  state:   { type: String, required: true, trim: true },
  order:   { type: Number, default: 0 },
  // Array order IS display order: index 0 (top) = newest person.
  persons: [personSchema],
  areas:   [String], // legacy flat list (old records only)
}, { timestamps: true });

module.exports = mongoose.model('FranchisePartner', franchisePartnerSchema);