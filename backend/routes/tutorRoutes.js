const router = require('express').Router();
const ctrl = require('../controllers/tutorController');
const auth = require('../middleware/authMiddleware');
const anyAuth = require('../middleware/anyAuthMiddleware');

// Admin-only, placed before the public `/` route's siblings so specific
// paths aren't swallowed by anything more general.
router.get('/upload-signature', auth, ctrl.getUploadSignature);
router.get('/filters', ctrl.getFilterOptions);

// Public — active listings only, supports ?subject=&level=&language=&q=
router.get('/', ctrl.getTutors);

// Admin — every listing, including hidden ones, same optional filters.
router.get('/all', anyAuth, ctrl.getAllTutors);

router.post('/', anyAuth, ctrl.createTutor);
router.put('/:id', anyAuth, ctrl.updateTutor);
router.delete('/:id', anyAuth, ctrl.deleteTutor);

module.exports = router;