export type ProjectType = 'new-home' | 'renovation' | 'interior' | 'commercial' | 'civil-works';

export const projectTypes: { id: ProjectType; label: string }[] = [
  { id: 'new-home', label: 'New Home' },
  { id: 'renovation', label: 'Renovation' },
  { id: 'interior', label: 'Interior' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'civil-works', label: 'Civil Works' },
];

export const budgetRanges: { id: string; label: string }[] = [
  { id: 'under-15l', label: 'Under \u20B915 Lakh' },
  { id: '15l-25l', label: '\u20B915 \u2013 25 Lakh' },
  { id: '25l-40l', label: '\u20B925 \u2013 40 Lakh' },
  { id: '40l-60l', label: '\u20B940 \u2013 60 Lakh' },
  { id: '60l-1cr', label: '\u20B960 Lakh \u2013 1 Crore' },
  { id: 'above-1cr', label: 'Above \u20B91 Crore' },
  { id: 'not-sure', label: 'Not Sure Yet' },
];

export const timelineOptions: { id: string; label: string }[] = [
  { id: 'immediately', label: 'Immediately' },
  { id: '1-3months', label: '1\u20133 Months' },
  { id: '3-6months', label: '3\u20136 Months' },
  { id: 'planning', label: 'Planning Stage' },
];

export const workTypes: { id: string; label: string }[] = [
  { id: 'road', label: 'Road Work' },
  { id: 'drainage', label: 'Drainage' },
  { id: 'compound-wall', label: 'Compound Wall' },
  { id: 'other', label: 'Other' },
];

export const propertyTypes: { id: string; label: string }[] = [
  { id: 'independent-house', label: 'Independent House' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'villa', label: 'Villa' },
  { id: 'other', label: 'Other' },
];
