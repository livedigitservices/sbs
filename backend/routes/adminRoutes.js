const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const leadCtrl = require('../controllers/leadController');
const auth = require('../middleware/authMiddleware');

router.post('/login', ctrl.login);
router.get('/dashboard/stats', auth, ctrl.getDashboardStats);
router.get('/associates', auth, ctrl.getAssociates);
router.get('/leads', auth, leadCtrl.getAllLeadsAdmin);
router.put('/associates/:id/toggle-active', auth, ctrl.toggleAssociateActive);

module.exports = router;