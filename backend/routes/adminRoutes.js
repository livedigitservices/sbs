const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const leadCtrl = require('../controllers/leadController');
const inviteCtrl = require('../controllers/registrationInviteController');
const auth = require('../middleware/authMiddleware');

router.post('/login', ctrl.login);
router.get('/dashboard/stats', auth, ctrl.getDashboardStats);
router.get('/associates', auth, ctrl.getAssociates);
router.get('/leads', auth, leadCtrl.getAllLeadsAdmin);
router.put('/associates/:id/toggle-active', auth, ctrl.toggleAssociateActive);
router.get('/registration-links', auth, inviteCtrl.listInvites);
router.post('/registration-links', auth, inviteCtrl.createInvite);
router.delete('/registration-links/:id', auth, inviteCtrl.revokeInvite);

module.exports = router;