export interface Location {
  id: string;
  city: string;
  state: string;
  label: string;
}

export const locations: Location[] = [
  { id: 'siruguppa', city: 'Siruguppa', state: 'Karnataka', label: 'Siruguppa, Karnataka' },
  { id: 'adoni', city: 'Adoni', state: 'Andhra Pradesh', label: 'Adoni, Andhra Pradesh' },
  { id: 'sindhanur', city: 'Sindhanur', state: 'Karnataka', label: 'Sindhanur, Karnataka' },
];

export const defaultLocation = locations[0];
