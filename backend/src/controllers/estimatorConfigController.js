import * as estimatorConfigService from '../services/estimatorConfigService.js';

const getConfig = async (req, res) => {
  try {
    const raw = await estimatorConfigService.getConfig();
    if (!raw) {
      return res.status(200).json({ success: true, data: { config: estimatorConfigService.DEFAULT_CONFIG } });
    }
    const { _id, __v, createdAt, updatedAt, ...config } = raw;
    res.status(200).json({ success: true, data: { config } });
  } catch (error) {
    console.error('GetConfig error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updatePackages = async (req, res) => {
  try {
    const { packages } = req.body;
    if (!Array.isArray(packages)) {
      return res.status(400).json({ success: false, message: 'packages must be an array' });
    }
    const raw = await estimatorConfigService.updatePackages(packages);
    const { _id, __v, createdAt, updatedAt, ...config } = raw;
    res.status(200).json({ success: true, message: 'Packages updated', data: { config } });
  } catch (error) {
    console.error('UpdatePackages error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateFloorCoverage = async (req, res) => {
  try {
    const { floorCoverage } = req.body;
    if (!floorCoverage || typeof floorCoverage !== 'object') {
      return res.status(400).json({ success: false, message: 'floorCoverage must be an object' });
    }
    const raw = await estimatorConfigService.updateFloorCoverage(floorCoverage);
    const { _id, __v, createdAt, updatedAt, ...config } = raw;
    res.status(200).json({ success: true, message: 'Floor coverage updated', data: { config } });
  } catch (error) {
    console.error('UpdateFloorCoverage error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateMilestones = async (req, res) => {
  try {
    const { milestones } = req.body;
    if (!Array.isArray(milestones)) {
      return res.status(400).json({ success: false, message: 'milestones must be an array' });
    }
    const raw = await estimatorConfigService.updateMilestones(milestones);
    const { _id, __v, createdAt, updatedAt, ...config } = raw;
    res.status(200).json({ success: true, message: 'Milestones updated', data: { config } });
  } catch (error) {
    console.error('UpdateMilestones error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateOptionalAddons = async (req, res) => {
  try {
    const { optionalAddons } = req.body;
    if (!Array.isArray(optionalAddons)) {
      return res.status(400).json({ success: false, message: 'optionalAddons must be an array' });
    }
    const raw = await estimatorConfigService.updateOptionalAddons(optionalAddons);
    const { _id, __v, createdAt, updatedAt, ...config } = raw;
    res.status(200).json({ success: true, message: 'Addons updated', data: { config } });
  } catch (error) {
    console.error('UpdateOptionalAddons error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updatePricing = async (req, res) => {
  try {
    const { pricing } = req.body;
    if (!pricing || typeof pricing !== 'object') {
      return res.status(400).json({ success: false, message: 'pricing must be an object' });
    }
    const raw = await estimatorConfigService.updatePricing(pricing);
    const { _id, __v, createdAt, updatedAt, ...config } = raw;
    res.status(200).json({ success: true, message: 'Pricing updated', data: { config } });
  } catch (error) {
    console.error('UpdatePricing error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateInclusions = async (req, res) => {
  try {
    const { inclusions } = req.body;
    if (!Array.isArray(inclusions)) {
      return res.status(400).json({ success: false, message: 'inclusions must be an array' });
    }
    const raw = await estimatorConfigService.updateInclusions(inclusions);
    const { _id, __v, createdAt, updatedAt, ...config } = raw;
    res.status(200).json({ success: true, message: 'Inclusions updated', data: { config } });
  } catch (error) {
    console.error('UpdateInclusions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateExclusions = async (req, res) => {
  try {
    const { exclusions } = req.body;
    if (!Array.isArray(exclusions)) {
      return res.status(400).json({ success: false, message: 'exclusions must be an array' });
    }
    const raw = await estimatorConfigService.updateExclusions(exclusions);
    const { _id, __v, createdAt, updatedAt, ...config } = raw;
    res.status(200).json({ success: true, message: 'Exclusions updated', data: { config } });
  } catch (error) {
    console.error('UpdateExclusions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const resetConfig = async (req, res) => {
  try {
    const raw = await estimatorConfigService.resetConfig();
    const { _id, __v, createdAt, updatedAt, ...config } = raw;
    res.status(200).json({ success: true, message: 'Config reset to defaults', data: { config } });
  } catch (error) {
    console.error('ResetConfig error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export {
  getConfig,
  updatePackages,
  updateFloorCoverage,
  updateMilestones,
  updateOptionalAddons,
  updatePricing,
  updateInclusions,
  updateExclusions,
  resetConfig,
};
