import { mergeApplicationConfig } from '@angular/core';
import { HttpBackend, HttpRequest, HttpResponse } from '@angular/common/http';
import { provideServerRendering, withRoutes, RenderMode, PrerenderFallback, ServerRoute } from '@angular/ssr';
import { of, throwError } from 'rxjs';
import { appConfig } from './app.config';
import { environment } from '../environments/environment';
import { SOLUTION_CONFIGS } from './features/solutions/solution-config';
import { snapshot, articleSlugs } from './generated/seo-snapshot';

// Build-only interceptor prevents repeated API traffic and private data fetching.
class PublicSnapshotBackend implements HttpBackend {
 handle(request: HttpRequest<unknown>) {
  const prefix = environment.apiUrl + '/';
  const key = request.urlWithParams.startsWith(prefix) ? request.urlWithParams.slice(prefix.length) : '';
  if (request.method !== 'GET' || !Object.hasOwn(snapshot, key)) return throwError(() => new Error('Unapproved prerender request'));
  return of(new HttpResponse({ status: 200, body: snapshot[key], url: request.urlWithParams }));
 }
}
const routes: ServerRoute[] = [
  ...['', 'about', 'solutions', 'projects', 'blog', 'contact', 'request-quote', '404'].map(path => ({ path, renderMode: RenderMode.Prerender as const })),
  { path: 'solutions/:slug', renderMode: RenderMode.Prerender, fallback: PrerenderFallback.Client,
    getPrerenderParams: async () => SOLUTION_CONFIGS.map(item => ({ slug: item.slug })) },
  { path: 'projects/:slug', renderMode: RenderMode.Prerender, fallback: PrerenderFallback.Client,
    getPrerenderParams: async () => snapshot['projects/'].map((item: { slug: string }) => ({ slug: item.slug })) },
  { path: 'blog/:slug', renderMode: RenderMode.Prerender, fallback: PrerenderFallback.Client,
    getPrerenderParams: async () => articleSlugs.map(slug => ({ slug })) },
  { path: '**', renderMode: RenderMode.Client },
];
export const config = mergeApplicationConfig(appConfig, { providers: [
  { provide: HttpBackend, useClass: PublicSnapshotBackend }, provideServerRendering(withRoutes(routes)),
] });
