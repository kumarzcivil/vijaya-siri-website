import { useEffect, useCallback, useState } from 'react';
import { getVapidKey, subscribePush, unsubscribePush } from '../api/notifications';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription(customerId?: string) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('[Push] Push notifications not supported');
      setLoading(false);
      return;
    }
    setSupported(true);
    console.log('[Push] Push notifications supported');

    // Check current permission status without requesting new permission
    const currentPerm = Notification.permission;
    setPermission(currentPerm as 'default' | 'granted' | 'denied');

    navigator.serviceWorker.ready.then((reg) => {
      console.log('[Push] Service worker ready, scope:', reg.scope);
      return reg.pushManager.getSubscription();
    }).then((sub) => {
      console.log('[Push] Existing subscription:', sub ? 'YES' : 'NO');
      if (sub) {
        console.log('[Push] Endpoint:', sub.endpoint?.substring(0, 60) + '...');
      }
      setSubscribed(!!sub);
      setLoading(false);
    }).catch((err) => {
      console.error('[Push] Error checking subscription:', err);
      setLoading(false);
    });
  }, [customerId]);

  const subscribe = useCallback(async () => {
    if (!supported) {
      console.log('[Push] Cannot subscribe: not supported');
      return false;
    }

    try {
      // Check notification permission
      console.log('[Push] Notification.permission:', Notification.permission);
      if (Notification.permission === 'denied') {
        console.error('[Push] Notifications are blocked by the user');
        return false;
      }

      if (Notification.permission === 'default') {
        console.log('[Push] Requesting notification permission...');
        const perm = await Notification.requestPermission();
        console.log('[Push] Permission result:', perm);
        if (perm !== 'granted') {
          console.error('[Push] Permission not granted');
          return false;
        }
      }

      const reg = await navigator.serviceWorker.ready;
      console.log('[Push] Service worker ready, scope:', reg.scope);

      // Check if already subscribed
      let sub = await reg.pushManager.getSubscription();
      if (sub) {
        console.log('[Push] Already subscribed, endpoint:', sub.endpoint?.substring(0, 60) + '...');
        setSubscribed(true);
        // Still send to backend in case it's not saved there
        await subscribePush(sub, customerId);
        return true;
      }

      // Get VAPID key from backend
      console.log('[Push] Fetching VAPID key...');
      const vapidKey = await getVapidKey();
      console.log('[Push] VAPID key received:', vapidKey ? vapidKey.substring(0, 20) + '...' : 'EMPTY');
      if (!vapidKey) {
        console.error('[Push] No VAPID key received from backend');
        return false;
      }

      // Subscribe to push
      console.log('[Push] Subscribing to push...');
      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log('[Push] Browser subscription created!');
      console.log('[Push] Endpoint:', sub.endpoint?.substring(0, 60) + '...');

      const subJson = sub.toJSON();
      console.log('[Push] Keys present:', {
        p256dh: !!subJson.keys?.p256dh,
        auth: !!subJson.keys?.auth,
      });

      // Send to backend
      console.log('[Push] Sending subscription to backend...');
      await subscribePush(sub, customerId);
      console.log('[Push] Subscription saved to backend!');

      setSubscribed(true);
      return true;
    } catch (err) {
      console.error('[Push] Subscribe error:', err);
      return false;
    }
  }, [supported, customerId]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return false;

      await unsubscribePush(sub.endpoint);
      await sub.unsubscribe();
      setSubscribed(false);
      return true;
    } catch (err) {
      console.error('[Push] Unsubscribe error:', err);
      return false;
    }
  }, [supported]);

  return { supported, subscribed, loading, subscribe, unsubscribe };
}
