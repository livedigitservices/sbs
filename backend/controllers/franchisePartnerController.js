const FranchisePartner = require('../models/FranchisePartner');

// ── Output shape ─────────────────────────────────────────────────────────────
// Only name + mobile numbers are returned. Old records (single `phone`, areas,
// PIN codes) still work: the old fields are ignored and nothing is rewritten.
const normalize = (doc) => {
  const s = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    _id: s._id,
    state: s.state,
    order: s.order,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    persons: (s.persons || []).map((p) => ({
      name: p.name,
      phones: p.phones && p.phones.length ? p.phones : (p.phone ? [p.phone] : []),
    })),
  };
};

// ── Input cleaning (whitelist) ───────────────────────────────────────────────
const cleanPersons = (list) =>
  (Array.isArray(list) ? list : [])
    .map((p) => ({
      name: String(p?.name || '').trim(),
      phones: (Array.isArray(p?.phones) ? p.phones : []).map((x) => String(x).trim()).filter(Boolean),
    }))
    .filter((p) => p.name || p.phones.length);

const sendError = (res, err) => res.status(400).json({
  message: err.errors ? Object.values(err.errors)[0].message : err.message,
});

// Newest state card first (lower `order` still wins if the admin sets one).
exports.getFranchisePartners = async (req, res) => {
  try {
    const states = await FranchisePartner.find().sort({ order: 1, createdAt: -1, _id: -1 }).lean();
    res.json(states.map(normalize));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFranchisePartner = async (req, res) => {
  try {
    const { state, order, persons } = req.body;
    const doc = await FranchisePartner.create({
      state: String(state || '').trim(),
      order: Number(order) || 0,
      persons: cleanPersons(persons),
    });
    res.status(201).json(normalize(doc));
  } catch (err) {
    sendError(res, err);
  }
};

exports.updateFranchisePartner = async (req, res) => {
  try {
    const doc = await FranchisePartner.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Franchise partner card not found' });
    const { state, order, persons } = req.body;
    if (state !== undefined) doc.state = String(state).trim();
    if (order !== undefined) doc.order = Number(order) || 0;
    if (persons !== undefined) doc.persons = cleanPersons(persons);
    await doc.save();
    res.json(normalize(doc));
  } catch (err) {
    sendError(res, err);
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