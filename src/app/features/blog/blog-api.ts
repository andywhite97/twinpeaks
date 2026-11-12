import { inject, Injectable, RESPONSE_INIT } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiClient } from '../../core/api/api-client';

export interface BlogCategory { id: number; name: string; slug: string; }
export interface BlogPost {
  id: number; title: string; slug: string; excerpt: string; body?: string;
  cover_image: string | null; cover_alt: string; author_name: string;
  category: BlogCategory | null; published_at: string; reading_minutes: number; is_featured: boolean;
  solutions: { id: number; title: string }[];
}
export interface BlogPage { count: number; next: string | null; previous: string | null; results: BlogPost[]; }
@Injectable({ providedIn: 'root' })
export class BlogApi {
  private api = inject(ApiClient);
  posts(category = '', page = 1) { return this.api.get<BlogPage>(`blog/posts/?page=${page}&category=${encodeURIComponent(category)}`); }
  post(slug: string) { return this.api.get<BlogPost>(`blog/posts/${encodeURIComponent(slug)}/`); }
  categories() { return this.api.get<BlogCategory[]>('blog/categories/'); }
}
export interface BlogContent { state: 'ready' | 'not-found' | 'error'; post?: BlogPost; title: string; description: string; noindex?: boolean; breadcrumbs: { name: string; path: string }[]; }
export const blogResolver: ResolveFn<BlogContent> = route => {
  const response = inject(RESPONSE_INIT, { optional: true });
  return inject(BlogApi).post(route.paramMap.get('slug') ?? '').pipe(map(post => ({ state: 'ready' as const, post, title: `${post.title} | TwinPeaks Journal`, description: post.excerpt, breadcrumbs: [{ name: 'Blog', path: '/blog' }] })), catchError(error => {
    const missing = error.status === 404;
    if (response) response.status = missing ? 404 : 503;
    return of({ state: missing ? 'not-found' as const : 'error' as const, title: 'Article unavailable | TwinPeaks', description: 'Please try another article or retry.', noindex: true, breadcrumbs: [] });
  }));
};
