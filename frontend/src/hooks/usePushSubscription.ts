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
      setLoading(false);
      return;
    }
    setSupported(true);

    const currentPerm = Notification.permission;
    setPermission(currentPerm as 'default' | 'granted' | 'denied');

    navigator.serviceWorker.ready.then((reg) => {
      return reg.pushManager.getSubscription();
    }).then((sub) => {
      setSubscribed(!!sub);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [customerId]);

  const subscribe = useCallback(async () => {
    if (!supported) return false;

    try {
      if (Notification.permission === 'denied') return false;

      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return false;
      }

      const reg = await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (sub) {
        setSubscribed(true);
        await subscribePush(sub, customerId);
        return true;
      }

      const vapidKey = await getVapidKey();
      if (!vapidKey) return false;

      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      await subscribePush(sub, customerId);

      setSubscribed(true);
      return true;
    } catch {
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
    } catch {
      return false;
    }
  }, [supported]);

  return { supported, subscribed, loading, subscribe, unsubscribe };
}
