import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BlogContent } from './blog-api';
import { NewsletterSignup } from './newsletter-signup';
import { mediaUrl } from '../../shared/media';
import { SOLUTION_CONFIGS, normalizeTitle } from '../solutions/solution-config';
@Component({ selector: 'app-blog-article', imports: [RouterLink, DatePipe, NewsletterSignup], styleUrl: './blog.scss', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="container journal"><a routerLink="/blog" class="text-link">← Back to the journal</a>@if (content().post; as post) { <header class="article-heading"><p class="eyebrow">{{ post.category?.name || 'Insights' }}</p><h1>{{ post.title }}</h1><p>{{ post.excerpt }}</p><div class="article-meta">{{ post.author_name }} · {{ post.published_at | date:'d MMM yyyy' }} · {{ post.reading_minutes }} min read</div></header>@if (media(post.cover_image); as image) { <img class="article-cover" [src]="image" [alt]="post.cover_alt" (error)="imageError($event)"> }<div class="article-layout"><article class="article-body" [innerHTML]="post.body"></article><aside class="article-services"><p class="eyebrow">PUT INSIGHT INTO PRACTICE</p><h2>Find your next step.</h2><p>Explore the solutions behind this article.</p>@for (solution of post.solutions; track solution.id) { <a class="related-service" [routerLink]="solutionPath(solution.title)">{{ solution.title }} →</a> }<a class="button button-primary" routerLink="/request-quote">Request a Quote →</a></aside></div><app-newsletter-signup source="article" /> } @else { <section class="journal-state"><h1>{{ content().state === 'not-found' ? 'Article not found' : 'Article temporarily unavailable' }}</h1><p>{{ content().state === 'not-found' ? 'This article may have moved or is not published.' : 'Please try again in a moment.' }}</p>@if (content().state === 'error') { <button class="button button-secondary" (click)="retry()">Retry</button> }<a class="button button-primary" routerLink="/blog">Explore the journal</a></section> }</div>` })
export class Article {
  private route = inject(ActivatedRoute); private router = inject(Router);
  private data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  readonly content = computed(() => this.data()['content'] as BlogContent); readonly media = mediaUrl;
  solutionPath(title: string) { const match = SOLUTION_CONFIGS.find(item => item.solutionTitles.some(value => normalizeTitle(value) === normalizeTitle(title))); return match ? ['/solutions', match.slug] : ['/solutions']; }
  retry() { void this.router.navigateByUrl(this.router.url, { onSameUrlNavigation: 'reload' }); }
  imageError(event: Event) { (event.target as HTMLImageElement).hidden = true; }
}
