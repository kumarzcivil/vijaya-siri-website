// Vijaya Siri Push Notification Service Worker
// Debug: Chrome DevTools > Application > Service Workers > Inspect (click "inspect" link)

self.addEventListener('push', (event) => {
  console.log('[SW] PUSH EVENT RECEIVED at', new Date().toISOString());

  let payload;
  try {
    payload = event.data ? event.data.json() : {};
    console.log('[SW] Parsed payload:', JSON.stringify(payload));
  } catch (e) {
    console.error('[SW] Failed to parse payload:', e);
    payload = {};
  }

  const title = payload.title || 'Vijaya Siri';
  const body = payload.body || payload.message || 'You have a new notification.';

  console.log('[SW] showNotification starting:', { title, body });

  event.waitUntil(
    self.registration.showNotification(title, { body })
      .then(() => console.log('[SW] showNotification() RESOLVED'))
      .catch(error => console.error('[SW] showNotification() FAILED:', error))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/account/notifications';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
