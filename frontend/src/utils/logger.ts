export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  data?: unknown;
}

type Listener = (entries: LogEntry[]) => void;

const MAX_ENTRIES = 200;
let entries: LogEntry[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn([...entries]));
}

function add(level: LogLevel, source: string, message: string, data?: unknown) {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
    level,
    source,
    message,
    data,
  };
  entries = [entry, ...entries].slice(0, MAX_ENTRIES);
  notify();
}

export const logger = {
  info: (source: string, message: string, data?: unknown) => add('info', source, message, data),
  warn: (source: string, message: string, data?: unknown) => add('warn', source, message, data),
  error: (source: string, message: string, data?: unknown) => add('error', source, message, data),
  success: (source: string, message: string, data?: unknown) => add('success', source, message, data),
  clear: () => { entries = []; notify(); },
  subscribe: (fn: Listener) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
  getEntries: () => [...entries],
};
