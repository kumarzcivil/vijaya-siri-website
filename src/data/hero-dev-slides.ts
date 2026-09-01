/**
 * DEVELOPMENT / QA SLIDE DATA ONLY
 *
 * These advertisements exist solely to visually verify the Hero slider
 * architecture during development. They are NOT production data.
 *
 * They are NOT managed by any admin UI.
 * They do NOT represent real offers or pricing.
 * They will be removed once the production advertisement system is live.
 */

import type { HeroAdvertisement } from './hero-advertisements';

const DEV_BASE = '/assests/Profix%20hero%20images';

export const DEV_HERO_ADS: HeroAdvertisement[] = [
  {
    id: 'dev_bathroom_reno',
    placement: 'pro-fix-hero',
    type: 'advertisement',
    eyebrow: 'Pro Fix Offer',
    title: 'Bathroom Renovation',
    description: 'Professional bathroom renovation for your home.',
    image: `${DEV_BASE}/02_Offer_Bathroom_Renovation.jpg`,
    ctaLabel: 'Explore',
    ctaTarget: '/quote',
    status: 'active',
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2030-12-31T23:59:59.999Z',
    priority: 10,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'dev_full_painting',
    placement: 'pro-fix-hero',
    type: 'advertisement',
    eyebrow: 'Pro Fix Offer',
    title: 'Full House Painting',
    description: 'Give your home a fresh new look.',
    image: `${DEV_BASE}/03_Offer_House_Painting.jpg`,
    ctaLabel: 'Explore',
    ctaTarget: '/quote',
    status: 'active',
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2030-12-31T23:59:59.999Z',
    priority: 20,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'dev_flooring_tile',
    placement: 'pro-fix-hero',
    type: 'advertisement',
    eyebrow: 'Pro Fix Offer',
    title: 'Flooring & Tile Work',
    description: 'Quality flooring solutions for every space.',
    image: `${DEV_BASE}/04_Offer_Flooring_Tile_Work.jpg`,
    ctaLabel: 'Explore',
    ctaTarget: '/quote',
    status: 'active',
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2030-12-31T23:59:59.999Z',
    priority: 30,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];
