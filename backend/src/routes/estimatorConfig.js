import express from 'express';
import {
  getConfig,
  updatePackages,
  updateFloorCoverage,
  updateMilestones,
  updateOptionalAddons,
  updatePricing,
  updateInclusions,
  updateExclusions,
  resetConfig,
} from '../controllers/estimatorConfigController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getConfig);
router.put('/packages', auth, updatePackages);
router.put('/floor-coverage', auth, updateFloorCoverage);
router.put('/milestones', auth, updateMilestones);
router.put('/addons', auth, updateOptionalAddons);
router.put('/pricing', auth, updatePricing);
router.put('/inclusions', auth, updateInclusions);
router.put('/exclusions', auth, updateExclusions);
router.post('/reset', auth, resetConfig);

export default router;
