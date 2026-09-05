import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import AccountSectionHeader from '../AccountSectionHeader';
import {
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '../../../api/notifications';

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

export default function AccountNotificationsSection() {
  const { customerId } = useOutletContext<{ customerId: string }>();
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

  const unread = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div>
        <AccountSectionHeader
          eyebrow="Updates"
          title="Notifications"
          description="Stay updated about your service requests, bookings, and account."
        />
        <p className="acc-empty-text">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div>
      <AccountSectionHeader
        eyebrow="Updates"
        title="Notifications"
        description="Stay updated about your service requests, bookings, and account."
      />

      {unread > 0 && (
        <div className="acc-unread-row">
          <p className="acc-unread">{unread} unread notification{unread > 1 ? 's' : ''}</p>
          <button type="button" className="acc-mark-all-btn" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="acc-empty">
          <h2 className="acc-empty-title">You&apos;re all caught up</h2>
          <p className="acc-empty-text">
            New updates about your bookings, quotes, and services will appear here.
          </p>
        </div>
      ) : (
        <div className="acc-notif-list">
          {notifications.map((n) => (
            <button
              type="button"
              key={n._id}
              className={`acc-notif${n.read ? '' : ' acc-notif--unread'}`}
              onClick={() => {
                if (!n.read) handleMarkRead(n._id);
              }}
            >
              <span className={`acc-notif-dot acc-notif-dot--${n.category}`} aria-hidden="true" />
              <span className="acc-notif-body">
                <span className="acc-notif-title">{n.title}</span>
                <span className="acc-notif-text">{n.message}</span>
                <span className="acc-notif-time">{timeAgo(n.createdAt)}</span>
              </span>
              {!n.read && <span className="acc-notif-badge">New</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
