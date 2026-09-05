import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import {
  fetchAdminNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,
  type Notification,
} from '../../api/notifications';

const CATEGORIES = ['booking', 'quote', 'service', 'account', 'system', 'offer'] as const;
type Cat = (typeof CATEGORIES)[number];

const DEFAULT_TOAST_MS = 2600;

export default function ControlCenterNotificationsSection() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<Cat>('service');
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((msg: string, isError = false) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ message: msg, isError });
    toastTimer.current = window.setTimeout(() => setToast(null), DEFAULT_TOAST_MS);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current !== null) window.clearTimeout(toastTimer.current); };
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminNotifications();
      setNotifications(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load notifications', true);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    try {
      const created = await createNotification({
        title: title.trim(),
        message: message.trim(),
        category,
      });
      setNotifications((prev) => [created, ...prev]);
      setTitle('');
      setMessage('');
      showToast('Notification sent');
    } catch (err: any) {
      showToast(err.message || 'Failed to send', true);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)));
    } catch (err: any) {
      showToast(err.message || 'Failed to update', true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast('Notification deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', true);
    }
  };

  if (loading) {
    return (
      <div className="cc-page">
        <header className="admin-dash-header">
          <span className="admin-dash-eyebrow">Control Center</span>
          <h1 className="admin-dash-title">Notifications</h1>
        </header>
        <div className="cc-loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="cc-page">
      <header className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">Notifications</h1>
        <p className="admin-dash-subtitle">
          Send operational updates and manage the customer notification feed.
        </p>
      </header>

      <form className="cc-send-form" onSubmit={handleSend}>
        <div className="cc-send-row">
          <input
            className="admin-input"
            placeholder="Notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="admin-input"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="cc-send-row cc-send-row--tools">
          <select
            className="admin-input cc-send-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as Cat)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="admin-btn admin-btn--save">Send</button>
        </div>
      </form>

      {notifications.length === 0 ? (
        <div className="cc-empty-state">
          <h2 className="cc-empty-title">No notifications yet</h2>
          <p className="cc-empty-text">
            Send a notification above or they will appear when bookings are confirmed.
          </p>
        </div>
      ) : (
        <div className="cc-list">
          {notifications.map((n) => (
            <article
              key={n._id}
              className={`cc-card cc-card--notif${n.read ? '' : ' cc-card--notif-unread'}`}
            >
              <div className="cc-card-body">
                <div className="cc-card-topline">
                  <span className={`cc-cat cc-cat--${n.category}`}>{n.category}</span>
                  {!n.read && <span className="cc-badge">Unread</span>}
                  {n.sent && <span className="cc-badge cc-badge--sent">Pushed</span>}
                </div>
                <h3 className="cc-card-title">{n.title}</h3>
                <p className="cc-card-meta">{n.message}</p>
                <p className="cc-card-sub">{n.customerId ? 'Customer notification' : 'All customers'} · {formatDate(n.createdAt)}</p>
              </div>
              <div className="cc-card-actions">
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => handleMarkRead(n._id)}
                  disabled={n.read}
                >
                  Mark read
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => handleDelete(n._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {toast && (
        <div className={`admin-toast${toast.isError ? ' admin-toast--error' : ''}`} role="status">
          <span className="admin-toast-dot" />{toast.message}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}
