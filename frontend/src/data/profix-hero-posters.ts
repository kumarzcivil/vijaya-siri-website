/* ========================
   PRO FIX HERO ADVERTISEMENT POSTERS
   Dedicated promotional feed — separate from Pro Fix Services.

   Conceptual Admin-managed record shape:
   poster
   ├── image
   ├── title/content
   ├── active
   ├── displayOrder
   ├── destinationType
   └── destination

   Rules:
   - destination '' → poster is NOT clickable.
   - No generic quotation/form fallback is ever applied here.
   - Active ads created via the existing Admin feed
     (hero-advertisements.ts) are appended after these defaults.
   ======================== */

export type ProFixPosterDestinationType = 'none' | 'internal' | 'external';

export interface ProFixHeroPoster {
  id: string;
  image: string;
  alt: string;
  title: string;
  active: boolean;
  displayOrder: number;
  destinationType: ProFixPosterDestinationType;
  destination: string;
}

const POSTER_BASE = '/assests/Profix%20hero%20images';

export const proFixHeroPosters: ProFixHeroPoster[] = [
  {
    id: 'ad_01',
    image: `${POSTER_BASE}/01_Service_ProFix.jpg`,
    alt: 'Vijaya Siri Pro Fix – Premium Home Services',
    title: 'Vijaya Siri Pro Fix',
    active: true,
    displayOrder: 1,
    destinationType: 'none',
    destination: '',
  },
  {
    id: 'ad_02',
    image: `${POSTER_BASE}/02_Offer_Bathroom_Renovation.jpg`,
    alt: 'Bathroom Renovation – Pro Fix Offer',
    title: 'Bathroom Renovation Offer',
    active: true,
    displayOrder: 2,
    destinationType: 'none',
    destination: '',
  },
  {
    id: 'ad_03',
    image: `${POSTER_BASE}/03_Offer_House_Painting.jpg`,
    alt: 'House Painting – Pro Fix Offer',
    title: 'House Painting Offer',
    active: true,
    displayOrder: 3,
    destinationType: 'none',
    destination: '',
  },
];
