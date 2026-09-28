const Lead = require('../models/Lead');

const EDITABLE_FIELDS = ['clientName', 'mobile', 'leadFor', 'status'];

function buildFilter(query, base = {}) {
  const { search, status, from, to } = query;
  const filter = { ...base };

  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
  }
  if (search) {
    const re = new RegExp(search, 'i');
    filter.$or = [{ clientName: re }, { leadFor: re }, { mobile: re }];
  }
  return filter;
}

async function paginatedFind(filter, query, res) {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);
  const sortField = ['clientName', 'createdAt', 'status'].includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortDir = query.sortDir === 'asc' ? 1 : -1;

  const [leads, totalCount] = await Promise.all([
    Lead.find(filter).sort({ [sortField]: sortDir }).skip((page - 1) * limit).limit(limit),
    Lead.countDocuments(filter),
  ]);

  res.json({ leads, totalCount, page, totalPages: Math.max(Math.ceil(totalCount / limit), 1) });
}

// ── Associate-scoped ──

exports.createLead = async (req, res) => {
  try {
    const data = {};
    EDITABLE_FIELDS.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });

    if (!data.clientName || !data.clientName.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!data.mobile || !data.mobile.trim()) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }
    if (!data.leadFor || !data.leadFor.trim()) {
      return res.status(400).json({ message: 'Lead for is required' });
    }

    const lead = await Lead.create({
      ...data,
      associate: req.associate.id,
      associateName: req.associate.name,
    });
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMyLeads = async (req, res) => {
  try {
    const filter = buildFilter(req.query, { associate: req.associate.id });
    await paginatedFind(filter, req.query, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMyLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, associate: req.associate.id });
    if (!lead) return res.status(404).json({ message: 'Lead not found or not owned by you' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── Admin-wide (read-only across all associates) ──

exports.getAllLeadsAdmin = async (req, res) => {
  try {
    const base = {};
    if (req.query.associate) base.associate = req.query.associate;
    const filter = buildFilter(req.query, base);
    await paginatedFind(filter, req.query, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};