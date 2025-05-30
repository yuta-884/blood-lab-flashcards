// Service Worker with Workbox
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

// プリキャッシュするファイルを自動的に取得
precacheAndRoute(self.__WB_MANIFEST);

// ランタイムキャッシュ - GET リクエストをネットワークファーストでキャッシュ
registerRoute(
  ({ request }) => request.method === 'GET',
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10
  })
);

// Service Worker のアクティベーション時に即座に制御を取得
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Service Worker の更新時に即座に更新
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
