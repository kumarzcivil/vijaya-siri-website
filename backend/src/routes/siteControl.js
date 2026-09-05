import express from 'express';
import {
  getSiteControl,
  getAllLocations,
  updateGlobal,
  updatePage,
  updateLocation,
  updateAccess,
  resetSiteControl,
} from '../controllers/siteControlController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSiteControl);
router.get('/locations', getAllLocations);
router.put('/global', auth, updateGlobal);
router.put('/pages/:page', auth, updatePage);
router.put('/locations/:locationId', auth, updateLocation);
router.put('/access', auth, updateAccess);
router.post('/reset', auth, resetSiteControl);

export default router;
