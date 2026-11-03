const { v2: cloudinary } = require('cloudinary');
const Resource = require('../models/Resource');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Newest media first. `_id` is the tie-breaker for records created in the same
// millisecond (ObjectIds increase over time, so it keeps the order stable).
const NEWEST_FIRST = { createdAt: -1, _id: -1 };

// Media lists must always reflect the latest uploads, so stop browsers / CDNs
// (incl. Vercel's edge) from serving a cached copy.
const noStore = (res) => res.set('Cache-Control', 'no-store, max-age=0');

const isHttpUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ isActive: true }).sort(NEWEST_FIRST);
    noStore(res);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort(NEWEST_FIRST);
    noStore(res);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Distinct list of categories already in use, so the admin can reuse
// existing categories instead of retyping/duplicating them.
exports.getCategories = async (req, res) => {
  try {
    const categories = await Resource.distinct('category');
    res.json(categories.filter(Boolean).sort((a, b) => a.localeCompare(b)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Signs a Cloudinary upload request so the browser can upload the file
// directly to Cloudinary, bypassing our Vercel serverless function's
// ~4.5MB request body limit entirely.
exports.getUploadSignature = async (req, res) => {
  try {
    const resourceType = req.query.resource_type === 'video' ? 'video' : 'image';
    const folder = resourceType === 'video' ? 'sbs-videos' : 'sbs-resources';
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);

    res.json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createResource = async (req, res) => {
  try {
    const { type, url, platform, isActive } = req.body;

    if (!['image', 'video', 'link'].includes(type)) return res.status(400).json({ message: 'Invalid media type' });
    if (!url || !String(url).trim()) return res.status(400).json({ message: 'A file or URL is required' });
    if (!isHttpUrl(String(url).trim())) return res.status(400).json({ message: 'Please provide a valid http(s) URL' });

    // Title / category are intentionally not collected any more.
    const resource = await Resource.create({
      type,
      url: String(url).trim(),
      platform: type === 'link' ? String(platform || '').trim() : '',
      ...(isActive !== undefined ? { isActive } : {}),
    });
    res.status(201).json(resource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const { type, url, platform, isActive } = req.body;
    const update = {};

    // Only touch fields that were actually sent, so legacy title / category
    // values on older records are never wiped by an edit.
    if (type !== undefined) {
      if (!['image', 'video', 'link'].includes(type)) return res.status(400).json({ message: 'Invalid media type' });
      update.type = type;
    }
    if (url !== undefined) {
      if (!String(url).trim() || !isHttpUrl(String(url).trim())) return res.status(400).json({ message: 'Please provide a valid http(s) URL' });
      update.url = String(url).trim();
    }
    if (isActive !== undefined) update.isActive = isActive;
    if (type !== undefined || platform !== undefined) {
      update.platform = (type === undefined || type === 'link') ? String(platform || '').trim() : '';
    }

    const resource = await Resource.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!resource) return res.status(404).json({ message: 'Media not found' });
    res.json(resource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Media not found' });
    res.json({ message: 'Media deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};