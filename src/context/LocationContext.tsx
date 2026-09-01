import { createContext, useContext, useState, type ReactNode } from 'react';
import { locations, defaultLocation, type Location } from '../data/locations';

interface LocationContextValue {
  selected: Location;
  options: Location[];
  select: (id: string) => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Location>(defaultLocation);

  const select = (id: string) => {
    const found = locations.find((l) => l.id === id);
    if (found) setSelected(found);
  };

  return (
    <LocationContext.Provider value={{ selected, options: locations, select }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
