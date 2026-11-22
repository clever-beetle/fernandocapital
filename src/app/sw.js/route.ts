import { NextResponse } from "next/server";
import { getVersionInfo } from "@/lib/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const ver = getVersionInfo(false).version;

  const swBody = `const CACHE_VERSION = 'fernandocapital-v${ver}';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll([
        '/logo.png',
        '/logo-navy.png',
        '/logo-gold.png',
        '/icon-192.png',
        '/icon-512.png',
        '/favicon.ico',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname === '/logo.png' ||
    url.pathname === '/icon-192.png' ||
    url.pathname === '/icon-512.png' ||
    url.pathname === '/favicon.ico';

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (isStaticAsset && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_VERSION + '-dynamic').then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION && name !== CACHE_VERSION + '-dynamic')
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});
`;

  return new NextResponse(swBody, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
