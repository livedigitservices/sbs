const { v2: cloudinary } = require('cloudinary');
const Tutor = require('../models/Tutor');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Builds a shared Mongo query from the optional ?subject=&level=&language=&q=
// query params used by both the public listing and the admin "all" view.
// Filters match case-insensitively against the array fields; `q` does a
// free-text match against name and profile info.
const buildFilterQuery = ({ subject, level, language, q }) => {
  const query = {};
  if (subject) query.subjects = { $regex: `^${subject.trim()}$`, $options: 'i' };
  if (level) query.levels = { $regex: `^${level.trim()}$`, $options: 'i' };
  if (language) query.languages = { $regex: `^${language.trim()}$`, $options: 'i' };
  if (q && q.trim()) {
    const rx = { $regex: q.trim(), $options: 'i' };
    query.$or = [{ name: rx }, { profileInfo: rx }, { subjects: rx }];
  }
  return query;
};

// Public: active listings, optionally filtered by subject/level/language/q.
//
// When one or more of subject/level/language are selected, this no longer
// requires a listing to match ALL of them (strict AND). Instead it ranks by
// how many of the selected filters each listing matches: a tutor matching
// all 3 selected filters appears first, then tutors matching 2, then
// tutors matching only 1. A listing matching NONE of the selected filters
// is excluded. Ties fall back to `order` then newest first.
//
// Note: this uses an exact match (via $in) against the array fields rather
// than the case-insensitive regex used elsewhere, because the dropdown
// values come straight from Tutor.distinct() (getFilterOptions) — i.e.
// they are guaranteed to equal what's stored, so exact match is safe and
// lets the match-count be computed cheaply in the aggregation pipeline.
exports.getTutors = async (req, res) => {
  try {
    const { subject, level, language, q } = req.query;

    const match = { isActive: true };
    if (q && q.trim()) {
      const rx = { $regex: q.trim(), $options: 'i' };
      match.$or = [{ name: rx }, { profileInfo: rx }, { subjects: rx }];
    }

    const hasFilters = Boolean(subject || level || language);

    // Case-insensitive "does this array field contain the chosen value" -> 1/0.
    const matches = (field, val) => ({
      $cond: [
        {
          $in: [
            val.trim().toLowerCase(),
            { $map: { input: { $ifNull: [field, []] }, as: 'v', in: { $toLower: '$$v' } } },
          ],
        },
        1,
        0,
      ],
    });

    // No subject/level/language chosen — plain listing, original sort.
    if (!hasFilters) {
      const tutors = await Tutor.find(match).sort({ order: 1, createdAt: -1 });
      return res.json(tutors);
    }

    // One or more filters chosen — score by match count, best matches first.
    const tutors = await Tutor.aggregate([
      { $match: match },
      {
        $addFields: {
          matchCount: {
            $add: [
              subject ? matches('$subjects', subject) : 0,
              level ? matches('$levels', level) : 0,
              language ? matches('$languages', language) : 0,
            ],
          },
        },
      },
      // Exclude listings that match none of the chosen filters.
      { $match: { matchCount: { $gt: 0 } } },
      { $sort: { matchCount: -1, order: 1, createdAt: -1 } },
    ]);

    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: every listing (active + hidden), same optional filters, for management.
exports.getAllTutors = async (req, res) => {
  try {
    const query = buildFilterQuery(req.query);
    // Admin drill-down: ?associate=<id> lists only that associate's tutors.
    if (req.admin && req.query.associate) query.createdByAssociate = req.query.associate;
    const tutors = await Tutor.find(query).sort({ order: 1, createdAt: -1 });
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public: distinct subject/level/language values (from active listings only)
// so the search bar's dropdowns reflect what's actually published.
exports.getFilterOptions = async (req, res) => {
  try {
    const [subjects, levels, languages] = await Promise.all([
      Tutor.distinct('subjects', { isActive: true }),
      Tutor.distinct('levels', { isActive: true }),
      Tutor.distinct('languages', { isActive: true }),
    ]);
    // Collapse values that differ only by case ("Maths" / "maths") so the
    // dropdowns don't show duplicates; matching above is case-insensitive.
    const uniq = (arr) => {
      const seen = new Map();
      arr.forEach(v => { const k = v.trim().toLowerCase(); if (k && !seen.has(k)) seen.set(k, v.trim()); });
      return [...seen.values()].sort((a, b) => a.localeCompare(b));
    };
    res.json({ subjects: uniq(subjects), levels: uniq(levels), languages: uniq(languages) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Signs a Cloudinary upload request so the browser uploads the tutor photo
// directly to Cloudinary, bypassing Vercel's ~4.5MB serverless body limit
// (same pattern as the Poster / Associate Resources upload flows).
exports.getUploadSignature = async (req, res) => {
  try {
    const folder = 'sbs-tutors';
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

const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

exports.createTutor = async (req, res) => {
  try {
    const { name, imageUrl, subjects, levels, languages, profileInfo, contactPhone, contactEmail, isActive, order } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });

    const tutor = await Tutor.create({
      name: name.trim(),
      imageUrl: (imageUrl || '').trim(),
      subjects: toArray(subjects),
      levels: toArray(levels),
      languages: toArray(languages),
      profileInfo: (profileInfo || '').trim(),
      contactPhone: (contactPhone || '').trim(),
      contactEmail: (contactEmail || '').trim(),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(order !== undefined ? { order } : {}),
      // Never trusted from the request body — taken from the verified token.
      createdByAssociate: req.associate ? req.associate.id : null,
    });
    res.status(201).json(tutor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTutor = async (req, res) => {
  try {
    const { name, imageUrl, subjects, levels, languages, profileInfo, contactPhone, contactEmail, isActive, order } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (imageUrl && imageUrl.trim()) update.imageUrl = imageUrl.trim();
    if (subjects !== undefined) update.subjects = toArray(subjects);
    if (levels !== undefined) update.levels = toArray(levels);
    if (languages !== undefined) update.languages = toArray(languages);
    if (profileInfo !== undefined) update.profileInfo = profileInfo.trim();
    if (contactPhone !== undefined) update.contactPhone = contactPhone.trim();
    if (contactEmail !== undefined) update.contactEmail = contactEmail.trim();
    if (isActive !== undefined) update.isActive = isActive;
    if (order !== undefined) update.order = order;

    const tutor = await Tutor.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!tutor) return res.status(404).json({ message: 'Listing not found' });
    res.json(tutor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTutor = async (req, res) => {
  try {
    await Tutor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};