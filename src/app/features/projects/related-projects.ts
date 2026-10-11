import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { ProjectsApi } from '../../core/api/content-api';
import { ProjectDto, RequestState } from '../../core/api/contracts';
import { normalizeTitle } from '../solutions/solution-config';
import { ProjectCard } from '../../shared/ui/cards';
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/states';

@Component({ selector: 'app-related-projects', imports: [ProjectCard, EmptyState, ErrorState, LoadingState], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (state() === 'loading') { <app-loading-state message="Loading related published projects…" /> } @else if (state() === 'error') { <app-error-state title="Related projects unavailable" message="Please retry to explore published work." (retry)="load()" /> } @else if (!related().length) { <app-empty-state title="No related projects published yet" message="Discuss your requirements with TwinPeaks to explore a solution for your space." /> } @else { <div class="projects-grid">@for (project of related(); track project.id) { <app-project-card [project]="project" /> }</div> }`,
})
export class RelatedProjects {
  private api = inject(ProjectsApi); private destroyRef = inject(DestroyRef); private request?: Subscription;
  readonly categories = input<readonly string[]>([]); readonly excludeSlug = input('');
  readonly records = signal<ProjectDto[]>([]); readonly state = signal<RequestState>('loading');
  readonly related = computed(() => { const categories = this.categories().map(normalizeTitle).filter(Boolean); return this.records().filter(project => project.slug !== this.excludeSlug() && categories.includes(normalizeTitle(project.category))).slice(0, 3); });
  constructor() { this.load(); }
  load(): void { this.request?.unsubscribe(); this.state.set('loading'); this.request = this.api.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: projects => { this.records.set(projects); this.state.set('ready'); }, error: () => this.state.set('error') }); }
}
