import { useEffect, useState } from 'react';
import { usePushSubscription } from '../../hooks/usePushSubscription';
import { useAuth } from '../../context/AuthContext';
import { Bell, X } from 'lucide-react';

// Map notification permission to colored status
const permissionStatus: Record<'default' | 'granted' | 'denied', { label: string; bg: string; color: string }> = {
  default: { label: 'Enable Notifications', bg: 'var(--color-bg-page)', color: 'var(--color-text-primary)' },
  granted: { label: 'Subscribed', bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
  denied: { label: 'Disabled', bg: '#fee2e2', color: '#dc2626' },
};

export default function PushAutoSubscribe() {
  const { user } = useAuth();
  const { supported, subscribed, loading, subscribe } = usePushSubscription(user?.id);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');

  // Update permission state when it changes
  useEffect(() => {
    if (Notification.permission === 'granted') setPermission('granted');
    else if (Notification.permission === 'denied') setPermission('denied');
    else setPermission('default');
  }, [Notification.permission]);

  const handleSubscribe = async () => {
    if (!supported) return;

    // Request permission if not already granted
    if (permission === 'default' || permission === 'denied') {
      const perm = await Notification.requestPermission();
      setPermission(perm as 'default' | 'granted' | 'denied');
      if (perm !== 'granted') return;
    }

    // Now subscribe
    await subscribe();
  };

  // Auto-subscribe if permission was already granted (e.g. from previous session)
  useEffect(() => {
    if (supported && !subscribed && permission === 'granted') {
      subscribe();
    }
  }, [supported, subscribed, permission, subscribe]);

  return (
    <div className="push-subscription-wrapper" aria-label="Push notification settings">
      {supported ? (
        <div className="push-subscription-status">
          {permission === 'denied' && (
            <span className="push-permission-status push-denied">
              <X size={14} /> {permissionStatus.denied.label}
            </span>
          )}

          {permission === 'granted' && subscribed && (
            <span className="push-permission-status push-subscribed">
              <Bell size={14} /> {permissionStatus.granted.label}
            </span>
          )}

          {!subscribed && permission !== 'denied' && (
            <button
              className="push-subscribe-btn"
              onClick={handleSubscribe}
              aria-label={permission === 'default' ? 'Enable push notifications' : 'Subscribe to notifications'}
            >
              <Bell size={16} />
              {permission === 'default' && permissionStatus.default.label}
            </button>
          )}

          {loading && <span className="push-loading">Loading...</span>}
        </div>
      ) : (
        <span className="push-not-supported">
          <X size={12} /> Push not supported
        </span>
      )}
    </div>
  );
}
