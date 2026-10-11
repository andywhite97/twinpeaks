import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'contact', renderMode: RenderMode.Server, headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  { path: 'request-quote', renderMode: RenderMode.Server, headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  { path: '404', renderMode: RenderMode.Server, status: 404 },
  { path: 'quotations/:token', renderMode: RenderMode.Client, headers: {
    'Cache-Control': 'private, no-store, max-age=0', 'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  } },
  { path: '**', renderMode: RenderMode.Server },
];
