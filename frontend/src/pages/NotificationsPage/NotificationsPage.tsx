import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '../../api/notifications';
import './NotificationsPage.css';

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchMyNotifications();
      setNotifications(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id: string) => {
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)));
    } catch {
      // silent
    }
  };

  const handleClearAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const unread = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="section-container">
          <div className="notifications-header">
            <h1 className="notifications-title">Notifications</h1>
          </div>
          <p className="notifications-loading">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="section-container">
        <div className="notifications-header">
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">
            Stay updated about your service requests, bookings, and account.
          </p>
          {unread > 0 && (
            <button type="button" className="notifications-clear-btn" onClick={handleClearAll}>
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <span className="notifications-empty-icon" aria-hidden="true">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </span>
            <h2 className="notifications-empty-title">You&apos;re all caught up</h2>
            <p className="notifications-empty-text">
              New updates about your bookings, quotes, and services will appear here.
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((n) => (
              <button
                type="button"
                key={n._id}
                className={`notifications-item${n.read ? '' : ' notifications-item--unread'}`}
                onClick={() => {
                  if (!n.read) handleMarkRead(n._id);
                }}
              >
                <span className={`notifications-dot notifications-dot--${n.category}`} aria-hidden="true" />
                <span className="notifications-item-body">
                  <span className="notifications-item-title">{n.title}</span>
                  <span className="notifications-item-text">{n.message}</span>
                  <span className="notifications-item-time">{timeAgo(n.createdAt)}</span>
                </span>
                {!n.read && <span className="notifications-item-badge">New</span>}
              </button>
            ))}
          </div>
        )}

        <div className="notifications-footer">
          <Link to="/account/notifications" className="notifications-manage-link">
            View all in Account
          </Link>
        </div>
      </div>
    </div>
  );
}
