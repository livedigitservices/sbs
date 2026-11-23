const Notice = require('../models/Notice');

// Public: active notices only.
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: every notice, including hidden ones.
exports.getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ order: 1, createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const { text, link, isActive, order } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Notice text is required' });

    const notice = await Notice.create({
      text: text.trim(),
      link: (link || '').trim(),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(order !== undefined ? { order } : {}),
    });
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const { text, link, isActive, order } = req.body;
    const update = {};
    if (text !== undefined) {
      if (!text.trim()) return res.status(400).json({ message: 'Notice text is required' });
      update.text = text.trim();
    }
    if (link !== undefined) update.link = link.trim();
    if (isActive !== undefined) update.isActive = isActive;
    if (order !== undefined) update.order = order;

    const notice = await Notice.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};