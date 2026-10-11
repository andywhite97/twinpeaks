import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { ProjectsApi } from '../../core/api/content-api';
import { ProjectDto, RequestState } from '../../core/api/contracts';
import { PageHeader } from '../../shared/ui/headings';
import { ProjectCard } from '../../shared/ui/cards';
import { CTASection } from '../../shared/ui/cta-section';
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/states';

@Component({ selector: 'app-projects', imports: [PageHeader, ProjectCard, CTASection, EmptyState, ErrorState, LoadingState], templateUrl: './projects.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class Projects {
  private api = inject(ProjectsApi); private destroyRef = inject(DestroyRef); private request?: Subscription;
  readonly records = signal<ProjectDto[]>([]); readonly state = signal<RequestState>('loading'); readonly category = signal('');
  readonly categories = computed(() => [...new Set(this.records().map(project => project.category?.trim()).filter((value): value is string => !!value))].sort((a, b) => a.localeCompare(b)));
  readonly filtered = computed(() => this.category() ? this.records().filter(project => project.category?.trim() === this.category()) : this.records());
  constructor() { this.load(); }
  load(): void { this.request?.unsubscribe(); this.state.set('loading'); this.request = this.api.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: projects => { this.records.set(projects); if (!this.categories().includes(this.category())) this.category.set(''); this.state.set('ready'); }, error: () => this.state.set('error') }); }
  count(category: string): number { return this.records().filter(project => project.category?.trim() === category).length; }
}
