
// This is a basic service worker file for handling push notifications.

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'REC Online';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icon-192x192.png', // Make sure you have an icon in your public folder
    badge: '/icon-96x96.png', // And a badge
    data: {
        url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});


self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Close the notification

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                client.navigate(urlToOpen);
                return client.focus();
            }
            return clients.openWindow(urlToOpen);
        })
    );
});


// Basic caching for offline support (managed by next-pwa)
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});

self.addEventListener('fetch', (event) => {
    // next-pwa will handle caching strategies.
    // This is just a placeholder.
});

