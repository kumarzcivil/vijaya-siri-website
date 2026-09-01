export interface Stat {
  id: string;
  value: string;
  label: string;
  icon: string;
  order: number;
  active: boolean;
}

export const statistics: Stat[] = [
  {
    id: 'homes',
    value: '500+',
    label: 'Homes Built',
    icon: 'home',
    order: 1,
    active: true,
  },
  {
    id: 'ontime',
    value: '98%',
    label: 'On-Time Delivery',
    icon: 'clock',
    order: 2,
    active: true,
  },
  {
    id: 'rating',
    value: '4.8',
    label: 'Customer Rating',
    icon: 'star',
    order: 3,
    active: true,
  },
  {
    id: 'satisfaction',
    value: '100%',
    label: 'Satisfaction',
    icon: 'shield-check',
    order: 4,
    active: true,
  },
];

const STATISTIC_STORAGE_KEY = 'vs_marketing_statistics';

function applyStatisticsOverlay(seed: Stat[]): Stat[] {
  try {
    const raw = localStorage.getItem(STATISTIC_STORAGE_KEY);
    if (!raw) return seed.map((s) => ({ ...s }));
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return seed.map((s) => ({ ...s }));
    const byId = new Map(seed.map((s) => [s.id, { ...s }]));
    stored.forEach((entry: Partial<Stat>) => {
      const id = entry.id;
      if (!id) return;
      byId.set(id, { ...(byId.get(id) as Stat), ...entry, id });
    });
    return Array.from(byId.values());
  } catch {
    return seed.map((s) => ({ ...s }));
  }
}

export function getMarketingStatistics(): Stat[] {
  return applyStatisticsOverlay(statistics);
}

export function saveMarketingStatistics(items: Stat[]): void {
  localStorage.setItem(STATISTIC_STORAGE_KEY, JSON.stringify(items));
}

export function updateMarketingStatistic(id: string, updates: Partial<Stat>): Stat[] {
  const items = getMarketingStatistics();
  const updated = items.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveMarketingStatistics(updated);
  return updated;
}

export function addMarketingStatistic(
  input: Omit<Stat, 'id' | 'order'> & { order?: number }
): Stat[] {
  const items = getMarketingStatistics();
  const maxOrder = items.reduce((max, s) => Math.max(max, s.order), 0);
  const stat: Stat = {
    ...input,
    id: `stat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    order: input.order || maxOrder + 1,
  };
  items.push(stat);
  saveMarketingStatistics(items);
  return items;
}

export function deleteMarketingStatistic(id: string): Stat[] {
  const items = getMarketingStatistics().filter((s) => s.id !== id);
  saveMarketingStatistics(items);
  return items;
}

export function resetMarketingStatistics(): Stat[] {
  localStorage.removeItem(STATISTIC_STORAGE_KEY);
  return statistics.map((s) => ({ ...s }));
}

export function moveMarketingStatistic(id: string, direction: 'up' | 'down'): Stat[] {
  const items = getMarketingStatistics();
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((s) => s.id === id);
  if (index < 0) return items;
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) return items;
  const current = sorted[index];
  sorted[index] = sorted[swapIndex];
  sorted[swapIndex] = current;
  const reordered = sorted.map((s, i) => ({ ...s, order: i + 1 }));
  saveMarketingStatistics(reordered);
  return reordered;
}

export function reorderMarketingStatistics(orderedIds: string[]): Stat[] {
  const items = getMarketingStatistics();
  const byId = new Map(items.map((s) => [s.id, s]));
  const placed = new Set<string>();
  const reordered: Stat[] = [];
  for (const id of orderedIds) {
    const stat = byId.get(id);
    if (stat && !placed.has(id)) {
      reordered.push({ ...stat });
      placed.add(id);
    }
  }
  for (const stat of items) {
    if (!placed.has(stat.id)) reordered.push({ ...stat });
  }
  const finalized = reordered.map((s, i) => ({ ...s, order: i + 1 }));
  saveMarketingStatistics(finalized);
  return finalized;
}

export function getActiveMarketingStatistics(): Stat[] {
  return getMarketingStatistics()
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);
}
