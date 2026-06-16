// JOTENG Service Worker — Web Push Notification Handler

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Tangani push notification masuk
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, body, icon, url, tag } = data;

  const options = {
    body: body || "Ada notifikasi baru",
    icon: icon || "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: tag || "joteng-notification",
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: url || "/" },
    actions: [
      { action: "open", title: "Lihat" },
      { action: "close", title: "Tutup" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title || "JOTENG", options));
});

// Tangani klik notifikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Kalau ada tab JOTENG yang sudah buka, fokus ke sana
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Kalau tidak ada, buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
