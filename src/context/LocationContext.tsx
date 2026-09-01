import { createContext, useContext, useState, type ReactNode } from 'react';
import { locations, defaultLocation, type Location } from '../data/locations';

interface LocationContextValue {
  selected: Location;
  options: Location[];
  select: (id: string) => void;
}

const SELECTED_LOCATION_STORAGE_KEY = 'vs_selected_location';

function readStoredLocation(): Location {
  try {
    const stored = window.localStorage.getItem(SELECTED_LOCATION_STORAGE_KEY);
    if (!stored) return defaultLocation;
    const found = locations.find((l) => l.id === stored);
    return found ?? defaultLocation;
  } catch {
    return defaultLocation;
  }
}

function persistLocation(id: string): void {
  try {
    window.localStorage.setItem(SELECTED_LOCATION_STORAGE_KEY, id);
  } catch {
    // storage unavailable — keep in-memory selection
  }
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Location>(readStoredLocation);

  const select = (id: string) => {
    const found = locations.find((l) => l.id === id);
    if (found) {
      setSelected(found);
      persistLocation(id);
    }
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
