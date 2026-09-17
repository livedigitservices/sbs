const express = require('express');
const router = express.Router();
const {
  getFranchisePartners,
  createFranchisePartner,
  updateFranchisePartner,
  deleteFranchisePartner,
} = require('../controllers/franchisePartnerController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/',       getFranchisePartners);
router.post('/',      authMiddleware, createFranchisePartner);
router.put('/:id',    authMiddleware, updateFranchisePartner);
router.delete('/:id', authMiddleware, deleteFranchisePartner);

module.exports = router;