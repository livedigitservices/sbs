const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const leadCtrl = require('../controllers/leadController');
const linkCtrl = require('../controllers/registrationLinkController');
const auth = require('../middleware/authMiddleware');

router.post('/login', ctrl.login);
router.get('/dashboard/stats', auth, ctrl.getDashboardStats);
router.get('/associates', auth, ctrl.getAssociates);
router.get('/leads', auth, leadCtrl.getAllLeadsAdmin);
router.put('/associates/:id/toggle-active', auth, ctrl.toggleAssociateActive);
router.get('/registration-link', auth, linkCtrl.getLink);
router.post('/registration-link/regenerate', auth, linkCtrl.regenerateLink);
router.put('/registration-link/status', auth, linkCtrl.setActive);

module.exports = router;