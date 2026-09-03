import { useNotifications } from '../../hooks/useNotifications';
import { deleteNotification, markNotificationRead, addNotification } from '../../store/notifications';
import { useState, type FormEvent } from 'react';

const CATEGORIES = ['booking', 'quote', 'service', 'account', 'system'] as const;
type Cat = (typeof CATEGORIES)[number];

export default function ControlCenterNotificationsSection() {
  const notifications = useNotifications();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<Cat>('service');

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    addNotification({
      title: title.trim(),
      message: message.trim(),
      category,
    });
    setTitle('');
    setMessage('');
  };

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
              key={n.id}
              className={`cc-card cc-card--notif${n.read ? '' : ' cc-card--notif-unread'}`}
            >
              <div className="cc-card-body">
                <div className="cc-card-topline">
                  <span className={`cc-cat cc-cat--${n.category}`}>{n.category}</span>
                  {!n.read && <span className="cc-badge">Unread</span>}
                </div>
                <h3 className="cc-card-title">{n.title}</h3>
                <p className="cc-card-meta">{n.message}</p>
                <p className="cc-card-sub">{n.customerId ? 'Customer notification' : 'All customers'} · {formatDate(n.createdAt)}</p>
              </div>
              <div className="cc-card-actions">
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => markNotificationRead(n.id)}
                  disabled={n.read}
                >
                  Mark read
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => deleteNotification(n.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
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
