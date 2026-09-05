import { useEffect } from 'react';
import { usePushSubscription } from '../../hooks/usePushSubscription';
import { useAuth } from '../../context/AuthContext';

// Auto-subscribes to push notifications if permission is already granted.
// Does NOT prompt for permission — only subscribes if already "granted".
export default function PushAutoSubscribe() {
  const { user } = useAuth();
  const { supported, subscribed, subscribe } = usePushSubscription(user?.id);

  useEffect(() => {
    if (supported && !subscribed && Notification.permission === 'granted') {
      subscribe();
    }
  }, [supported, subscribed, subscribe]);

  return null;
}
