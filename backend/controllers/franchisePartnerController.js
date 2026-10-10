const FranchisePartner = require('../models/FranchisePartner');

const isPin = (v) => /^\d{6}$/.test(v || '');

// ── Output shape ─────────────────────────────────────────────────────────────
// Old records had a flat `areas` list on the state and one `phone` per person.
// This converts them to the new shape on the fly (nothing is written to the DB).
// Old flat areas cannot be attributed to a person, so they are shown under the
// first person until the admin moves them.
const normalize = (doc) => {
  const s = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const legacyAreas = (s.areas || []).map((a) => {
    const v = String(a).trim();
    const m = v.match(/^(\d{6})\s*[-,]?\s*(.*)$/); // "508001 Nalgonda" -> PIN + area
    return m ? { area: m[2].trim(), pincode: m[1] } : { area: v, pincode: '' };
  });
  s.persons = (s.persons || []).map((p, i) => ({
    name: p.name,
    phones: p.phones && p.phones.length ? p.phones : (p.phone ? [p.phone] : []),
    areas: p.areas && p.areas.length ? p.areas : (i === 0 ? legacyAreas : []),
  }));
  delete s.areas;
  return s;
};

// ── Input cleaning (whitelist) ───────────────────────────────────────────────
const cleanPersons = (list) =>
  (Array.isArray(list) ? list : [])
    .map((p) => ({
      name: String(p?.name || '').trim(),
      phones: (Array.isArray(p?.phones) ? p.phones : []).map((x) => String(x).trim()).filter(Boolean),
      areas: (Array.isArray(p?.areas) ? p.areas : [])
        .map((a) => ({ area: String(a?.area || '').trim(), pincode: String(a?.pincode || '').trim() }))
        .filter((a) => a.area || a.pincode),
    }))
    .filter((p) => p.name || p.phones.length || p.areas.length);

const sendError = (res, err) => res.status(400).json({
  message: err.errors ? Object.values(err.errors)[0].message : err.message,
});

exports.getFranchisePartners = async (req, res) => {
  try {
    const states = await FranchisePartner.find().sort({ order: 1, createdAt: 1 }).lean();
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
    if (persons !== undefined) {
      doc.persons = cleanPersons(persons);
      doc.set('areas', undefined); // old flat list is replaced by per-person areas
    }
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