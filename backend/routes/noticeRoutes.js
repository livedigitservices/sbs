const router = require('express').Router();
const ctrl = require('../controllers/noticeController');
const auth = require('../middleware/authMiddleware');

// Public — active notices only.
router.get('/', ctrl.getNotices);

// Admin
router.get('/all', auth, ctrl.getAllNotices);
router.post('/', auth, ctrl.createNotice);
router.put('/:id', auth, ctrl.updateNotice);
router.delete('/:id', auth, ctrl.deleteNotice);

module.exports = router;