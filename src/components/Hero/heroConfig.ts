/**
 * Hero visual configuration.
 *
 * Admin-controllable fields:
 * - visuals[].active     → show/hide individual visuals
 * - visuals[].order      → display sequence
 * - rotation.enabled     → start/stop auto-rotation
 * - rotation.displayDuration → seconds per visual
 * - rotation.transitionDuration → crossfade ms
 *
 * To add a new visual, append to the visuals array.
 * To replace an asset, update the png/webp paths.
 */

const HERO_BASE = '/assests/hero';

export interface HeroVisualEntry {
  id: string;
  title: string;
  png: string;
  webp: string;
  order: number;
  active: boolean;
}

export interface HeroRotationConfig {
  enabled: boolean;
  displayDuration: number;
  transitionDuration: number;
}

export interface HeroConfig {
  visuals: HeroVisualEntry[];
  rotation: HeroRotationConfig;
}

export const heroConfig: HeroConfig = {
  visuals: [
    {
      id: 'hero-01',
      title: 'Modern Indian Villa',
      png: `${HERO_BASE}/vijaya-siri-hero-01-modern-indian-villa.png`,
      webp: `${HERO_BASE}/vijaya-siri-hero-01-modern-indian-villa.webp`,
      order: 1,
      active: true,
    },
    {
      id: 'hero-02',
      title: 'Contemporary Home',
      png: `${HERO_BASE}/vijaya-siri-hero-02-contemporary-home.png`,
      webp: `${HERO_BASE}/vijaya-siri-hero-02-contemporary-home.webp`,
      order: 2,
      active: true,
    },
    {
      id: 'hero-03',
      title: 'Modern Duplex',
      png: `${HERO_BASE}/vijaya-siri-hero-03-modern-duplex.png`,
      webp: `${HERO_BASE}/vijaya-siri-hero-03-modern-duplex.webp`,
      order: 3,
      active: true,
    },
    {
      id: 'hero-04',
      title: 'Premium Residence',
      png: `${HERO_BASE}/vijaya-siri-hero-04-premium-residence.png`,
      webp: `${HERO_BASE}/vijaya-siri-hero-04-premium-residence.webp`,
      order: 4,
      active: true,
    },
    {
      id: 'hero-05',
      title: 'Elegant Compact Home',
      png: `${HERO_BASE}/vijaya-siri-hero-05-elegant-compact-home.png`,
      webp: `${HERO_BASE}/vijaya-siri-hero-05-elegant-compact-home.webp`,
      order: 5,
      active: true,
    },
  ],
  rotation: {
    enabled: true,
    displayDuration: 5500,
    transitionDuration: 800,
  },
};

/** Returns active visuals sorted by order. */
export function getActiveVisuals(): HeroVisualEntry[] {
  return heroConfig.visuals
    .filter((v) => v.active)
    .sort((a, b) => a.order - b.order);
}
