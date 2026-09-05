import * as siteControlService from '../services/siteControlService.js';

const VALID_PAGES = ['home', 'projects', 'packages', 'proFix', 'quickFix', 'about', 'quote', 'account', 'offers'];
const VALID_LOCATIONS = ['siruguppa', 'adoni', 'sindhanur'];

function formatDoc(raw) {
  const locations = {};
  if (raw.locations && typeof raw.locations === 'object') {
    for (const [key, val] of Object.entries(raw.locations)) {
      locations[key] = { quickFix: !!val.quickFix, proFix: !!val.proFix };
    }
  }
  return {
    maintenanceMode: !!raw.maintenanceMode,
    pages: raw.pages || {},
    locations,
    quickFixLoginRequired: !!raw.quickFixLoginRequired,
    proFixLoginRequired: !!raw.proFixLoginRequired,
    updatedAt: raw.updatedAt,
  };
}

function formatLocations(raw) {
  const locations = {};
  if (raw.locations && typeof raw.locations === 'object') {
    for (const [key, val] of Object.entries(raw.locations)) {
      locations[key] = { quickFix: !!val.quickFix, proFix: !!val.proFix };
    }
  }
  return {
    quickFixLoginRequired: !!raw.quickFixLoginRequired,
    proFixLoginRequired: !!raw.proFixLoginRequired,
    locations,
  };
}

const getSiteControl = async (req, res) => {
  try {
    const raw = await siteControlService.getSiteControl();
    res.status(200).json({ success: true, data: { siteControl: formatDoc(raw) } });
  } catch (error) {
    console.error('GetSiteControl error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllLocations = async (req, res) => {
  try {
    const raw = await siteControlService.getSiteControl();
    res.status(200).json({ success: true, data: { locations: formatLocations(raw) } });
  } catch (error) {
    console.error('GetAllLocations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateGlobal = async (req, res) => {
  try {
    const { maintenanceMode } = req.body;
    if (typeof maintenanceMode !== 'boolean') {
      return res.status(400).json({ success: false, message: 'maintenanceMode must be a boolean' });
    }
    const raw = await siteControlService.updateGlobal(maintenanceMode);
    res.status(200).json({ success: true, message: 'Global status updated', data: { siteControl: formatDoc(raw) } });
  } catch (error) {
    console.error('UpdateGlobal error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updatePage = async (req, res) => {
  try {
    const { page } = req.params;
    if (!VALID_PAGES.includes(page)) {
      return res.status(400).json({ success: false, message: `Invalid page. Must be one of: ${VALID_PAGES.join(', ')}` });
    }
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, message: 'enabled must be a boolean' });
    }
    const raw = await siteControlService.updatePage(page, enabled);
    res.status(200).json({ success: true, message: `Page "${page}" ${enabled ? 'enabled' : 'disabled'}`, data: { siteControl: formatDoc(raw) } });
  } catch (error) {
    console.error('UpdatePage error:', error.message);
    res.status(400).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    if (!VALID_LOCATIONS.includes(locationId)) {
      return res.status(400).json({ success: false, message: `Invalid location. Must be one of: ${VALID_LOCATIONS.join(', ')}` });
    }
    const { quickFix, proFix } = req.body;
    if (typeof quickFix !== 'boolean' || typeof proFix !== 'boolean') {
      return res.status(400).json({ success: false, message: 'quickFix and proFix must be booleans' });
    }
    const raw = await siteControlService.updateLocation(locationId, { quickFix, proFix });
    res.status(200).json({ success: true, message: `Location "${locationId}" updated`, data: { siteControl: formatDoc(raw) } });
  } catch (error) {
    console.error('UpdateLocation error:', error.message, error.stack);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const updateAccess = async (req, res) => {
  try {
    const { quickFixLoginRequired, proFixLoginRequired } = req.body;
    const data = {};
    if (quickFixLoginRequired !== undefined) {
      if (typeof quickFixLoginRequired !== 'boolean') {
        return res.status(400).json({ success: false, message: 'quickFixLoginRequired must be a boolean' });
      }
      data.quickFixLoginRequired = quickFixLoginRequired;
    }
    if (proFixLoginRequired !== undefined) {
      if (typeof proFixLoginRequired !== 'boolean') {
        return res.status(400).json({ success: false, message: 'proFixLoginRequired must be a boolean' });
      }
      data.proFixLoginRequired = proFixLoginRequired;
    }
    const raw = await siteControlService.updateAccess(data);
    res.status(200).json({ success: true, message: 'Access settings updated', data: { siteControl: formatDoc(raw) } });
  } catch (error) {
    console.error('UpdateAccess error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const resetSiteControl = async (req, res) => {
  try {
    const raw = await siteControlService.resetSiteControl();
    res.status(200).json({ success: true, message: 'Site control reset to defaults', data: { siteControl: formatDoc(raw) } });
  } catch (error) {
    console.error('ResetSiteControl error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { getSiteControl, getAllLocations, updateGlobal, updatePage, updateLocation, updateAccess, resetSiteControl };
