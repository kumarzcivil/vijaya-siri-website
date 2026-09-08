import { useEffect, useState } from 'react';
import { logger, type LogEntry, type LogLevel } from '../../utils/logger';
import './LogPanel.css';

const LEVEL_ICONS: Record<LogLevel, string> = {
  info: 'i',
  warn: '!',
  error: '\u00D7',
  success: '\u2713',
};

export default function LogPanel() {
  const [entries, setEntries] = useState<LogEntry[]>(logger.getEntries());
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');

  useEffect(() => {
    return logger.subscribe(setEntries);
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.level === filter);
  const errorCount = entries.filter((e) => e.level === 'error').length;

  if (!open) {
    return (
      <button className="log-toggle" onClick={() => setOpen(true)} type="button" aria-label="Open logs">
        <span className="log-toggle-icon">{'\u2261'}</span>
        {errorCount > 0 && <span className="log-toggle-badge">{errorCount}</span>}
      </button>
    );
  }

  return (
    <div className="log-panel">
      <div className="log-panel-header">
        <span className="log-panel-title">Logs</span>
        <div className="log-panel-filters">
          {(['all', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
            <button
              key={lvl}
              className={`log-filter-btn ${filter === lvl ? 'log-filter-btn--active' : ''}`}
              onClick={() => setFilter(lvl)}
              type="button"
            >
              {lvl === 'all' ? 'All' : lvl}
              {lvl !== 'all' && <span className={`log-filter-count log-filter-count--${lvl}`}>
                {entries.filter((e) => e.level === lvl).length}
              </span>}
            </button>
          ))}
        </div>
        <div className="log-panel-actions">
          <button className="log-action-btn" onClick={() => logger.clear()} type="button">Clear</button>
          <button className="log-action-btn" onClick={() => setOpen(false)} type="button">{'\u2715'}</button>
        </div>
      </div>
      <div className="log-panel-body">
        {filtered.length === 0 && <div className="log-empty">No logs</div>}
        {filtered.map((entry) => (
          <div key={entry.id} className={`log-entry log-entry--${entry.level}`}>
            <span className="log-time">{entry.timestamp}</span>
            <span className={`log-level log-level--${entry.level}`}>{LEVEL_ICONS[entry.level]}</span>
            <span className="log-source">{entry.source}</span>
            <span className="log-message">{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
