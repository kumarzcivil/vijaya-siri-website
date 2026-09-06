import { useEffect, useState } from 'react';
import { usePushSubscription } from '../../hooks/usePushSubscription';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

export default function PushAutoSubscribe() {
  const { user } = useAuth();
  const { supported, subscribed, loading, subscribe } = usePushSubscription(user?.id);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    if (Notification.permission === 'granted') setPermission('granted');
    else if (Notification.permission === 'denied') setPermission('denied');
    else setPermission('default');
  }, [Notification.permission]);

  const handleSubscribe = async () => {
    if (!supported) return;
    if (permission === 'default' || permission === 'denied') {
      const perm = await Notification.requestPermission();
      setPermission(perm as 'default' | 'granted' | 'denied');
      if (perm !== 'granted') return;
    }
    await subscribe();
  };

  useEffect(() => {
    if (supported && !subscribed && permission === 'granted') {
      subscribe();
    }
  }, [supported, subscribed, permission, subscribe]);

  if (!supported) return null;

  const isSubscribed = permission === 'granted' && subscribed;

  if (isSubscribed || permission === 'denied') return null;

  return (
    <div className="push-topbar" aria-label="Push notification settings">
      <div className="push-topbar-inner">
        {loading ? (
          <span className="push-topbar-item push-topbar-item--loading">
            <span className="push-topbar-spinner" />
          </span>
        ) : (
          <button
            className="push-topbar-item push-topbar-item--btn"
            onClick={handleSubscribe}
            aria-label="Enable push notifications"
          >
            <Bell size={14} strokeWidth={2} />
            <span className="push-topbar-label">Enable notifications</span>
          </button>
        )}
      </div>
    </div>
  );
}
