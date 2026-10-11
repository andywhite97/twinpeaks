import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { HomepageApi, ProjectsApi } from '../../core/api/content-api';
import { HomepageDto, ProjectDto, RequestState } from '../../core/api/contracts';
import { HeroSection } from '../../shared/ui/hero-section';
import { SectionHeading } from '../../shared/ui/headings';
import { FeatureCard, ProjectCard, SolutionCard } from '../../shared/ui/cards';
import { ProcessSteps } from '../../shared/ui/process-steps';
import { CTASection } from '../../shared/ui/cta-section';
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/states';
import { SecondaryButton } from '../../shared/ui/buttons';
import { BENEFITS, SOLUTIONS } from './solution-categories';
import { normalizeTitle } from '../solutions/solution-config';
import { SolutionCatalog } from '../solutions/solution-catalog';

@Component({ selector: 'app-home', imports: [HeroSection, SectionHeading, FeatureCard, ProjectCard, SolutionCard,
  ProcessSteps, CTASection, EmptyState, ErrorState, LoadingState, SecondaryButton],
  templateUrl: './home.html', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private homepageApi = inject(HomepageApi); private projectsApi = inject(ProjectsApi);
  readonly catalog = inject(SolutionCatalog);
  private destroyRef = inject(DestroyRef);
  private homepageRequest?: Subscription; private projectsRequest?: Subscription;
  readonly homepage = signal<HomepageDto | null>(null); readonly homepageState = signal<RequestState>('loading');
  readonly projects = signal<ProjectDto[]>([]); readonly projectsState = signal<RequestState>('loading');
  readonly solutionRecords = this.catalog.records; readonly solutionsState = this.catalog.state;
  readonly benefits = BENEFITS; readonly solutions = SOLUTIONS;

  ngOnInit(): void { this.loadHomepage(); this.loadProjects(); this.catalog.ensureLoaded(); }
  loadHomepage(): void {
    this.homepageRequest?.unsubscribe(); this.homepageState.set('loading');
    this.homepageRequest = this.homepageApi.getHomepage().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => { this.homepage.set(value); this.homepageState.set('ready'); }, error: () => this.homepageState.set('error'),
    });
  }
  loadProjects(): void {
    this.projectsRequest?.unsubscribe(); this.projectsState.set('loading');
    this.projectsRequest = this.projectsApi.getFeaturedProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => { this.projects.set(value.slice(0, 3)); this.projectsState.set('ready'); }, error: () => this.projectsState.set('error'),
    });
  }
  loadSolutions(): void {
    this.catalog.load();
  }
  solutionImage(title: string): string | null {
    const matches = this.solutionRecords().filter(record => normalizeTitle(record.title) === normalizeTitle(title));
    return matches.length === 1 ? matches[0]!.image || null : null;
  }
  solutionSummary(title: string): string {
    const matches = this.solutionRecords().filter(record => normalizeTitle(record.title) === normalizeTitle(title));
    return matches.length === 1 ? matches[0]!.description : '';
  }
}
