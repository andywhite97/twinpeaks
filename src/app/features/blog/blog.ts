import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, of, switchMap } from 'rxjs';
import { BlogApi, BlogCategory, BlogPage } from './blog-api';
import { NewsletterSignup } from './newsletter-signup';
import { mediaUrl } from '../../shared/media';

@Component({ selector: 'app-blog', imports: [RouterLink, DatePipe, NewsletterSignup], templateUrl: './blog.html', styleUrl: './blog.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class Blog {
  private api = inject(BlogApi); private destroy = inject(DestroyRef); private requests = new Subject<void>();
  readonly data = signal<BlogPage | null>(null); readonly categories = signal<BlogCategory[]>([]);
  readonly state = signal<'loading' | 'ready' | 'error'>('loading'); readonly category = signal(''); readonly page = signal(1);
  readonly featured = computed(() => this.page() === 1 && !this.category() ? this.data()?.results[0] : undefined);
  readonly latest = computed(() => [...(this.data()?.results ?? [])].filter(post => post.id !== this.featured()?.id).sort((a,b) => b.published_at.localeCompare(a.published_at)).slice(0, 3));
  readonly cards = computed(() => (this.data()?.results ?? []).filter(post => post.id !== this.featured()?.id));
  readonly media = mediaUrl;
  constructor() {
    this.api.categories().pipe(takeUntilDestroyed(this.destroy)).subscribe({ next: data => this.categories.set(data), error: () => {} });
    this.requests.pipe(switchMap(() => { this.state.set('loading'); return this.api.posts(this.category(), this.page()).pipe(catchError(() => of(null))); }), takeUntilDestroyed(this.destroy)).subscribe(data => { this.data.set(data); this.state.set(data ? 'ready' : 'error'); });
    this.load();
  }
  load() { this.requests.next(); }
  filter(slug: string) { this.category.set(slug); this.page.set(1); this.load(); }
  paginate(delta: number) { this.page.update(value => Math.max(1, value + delta)); this.load(); }
  imageError(event: Event) { const img = event.target as HTMLImageElement; img.hidden = true; }
}
