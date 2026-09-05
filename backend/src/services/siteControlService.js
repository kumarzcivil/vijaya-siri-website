import SiteControl from '../models/SiteControl.js';

const COLLECTION = 'sitecontrols';

const DEFAULT_LOCATIONS = {
  siruguppa: { quickFix: true, proFix: true },
  adoni: { quickFix: false, proFix: false },
  sindhanur: { quickFix: false, proFix: false },
};

const DEFAULTS = {
  maintenanceMode: false,
  pages: {
    home: true,
    projects: true,
    packages: true,
    proFix: true,
    quickFix: true,
    about: true,
    quote: true,
    account: true,
    offers: true,
  },
  locations: DEFAULT_LOCATIONS,
  quickFixLoginRequired: true,
  proFixLoginRequired: true,
};

const LOCKED_PAGES = ['legalPages', 'admin'];

function rawCol() {
  return SiteControl.db.collection(COLLECTION);
}

async function ensureDocument() {
  const count = await rawCol().countDocuments();
  if (count === 0) {
    await rawCol().insertOne({
      ...DEFAULTS,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });
  }
}

async function getSiteControlRaw() {
  await ensureDocument();
  const doc = await rawCol().findOne({});
  return doc;
}

async function updateAndReturn(update) {
  await ensureDocument();
  await rawCol().updateOne({}, { $set: { ...update, updatedAt: new Date() } });
  return getSiteControlRaw();
}

async function getSiteControl() {
  return getSiteControlRaw();
}

async function getAllLocations() {
  const raw = await getSiteControlRaw();
  const out = {};
  if (raw.locations) {
    for (const [key, val] of Object.entries(raw.locations)) {
      out[key] = { quickFix: !!val.quickFix, proFix: !!val.proFix };
    }
  }
  return out;
}

async function patchLocationService(locationId, service, enabled) {
  const field = `locations.${locationId}.${service}`;
  return updateAndReturn({ [field]: enabled });
}

async function updateGlobal(maintenanceMode) {
  return updateAndReturn({ maintenanceMode });
}

async function updatePage(page, enabled) {
  if (LOCKED_PAGES.includes(page)) {
    throw new Error(`Page "${page}" is locked and cannot be disabled`);
  }
  return updateAndReturn({ [`pages.${page}`]: enabled });
}

async function updateLocation(locationId, data) {
  const val = { quickFix: data.quickFix ?? false, proFix: data.proFix ?? false };
  return updateAndReturn({ [`locations.${locationId}`]: val });
}

async function updateAccess(data) {
  const update = {};
  if (data.quickFixLoginRequired !== undefined) update.quickFixLoginRequired = data.quickFixLoginRequired;
  if (data.proFixLoginRequired !== undefined) update.proFixLoginRequired = data.proFixLoginRequired;
  if (Object.keys(update).length > 0) {
    return updateAndReturn(update);
  }
  return getSiteControlRaw();
}

async function resetSiteControl() {
  return updateAndReturn({
    maintenanceMode: DEFAULTS.maintenanceMode,
    pages: { ...DEFAULTS.pages },
    locations: {
      siruguppa: { quickFix: true, proFix: true },
      adoni: { quickFix: false, proFix: false },
      sindhanur: { quickFix: false, proFix: false },
    },
    quickFixLoginRequired: DEFAULTS.quickFixLoginRequired,
    proFixLoginRequired: DEFAULTS.proFixLoginRequired,
  });
}

export {
  getSiteControl,
  getAllLocations,
  patchLocationService,
  updateGlobal,
  updatePage,
  updateLocation,
  updateAccess,
  resetSiteControl,
};
