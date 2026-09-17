const FranchisePartner = require('../models/FranchisePartner');

exports.getFranchisePartners = async (req, res) => {
  try {
    const partners = await FranchisePartner.find().sort({ order: 1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFranchisePartner = async (req, res) => {
  try {
    const partner = await FranchisePartner.create(req.body);
    res.status(201).json(partner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateFranchisePartner = async (req, res) => {
  try {
    const partner = await FranchisePartner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!partner) return res.status(404).json({ message: 'Franchise partner card not found' });
    res.json(partner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteFranchisePartner = async (req, res) => {
  try {
    await FranchisePartner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};