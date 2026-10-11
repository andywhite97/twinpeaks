import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { HomepageApi, ProjectsApi, ServicesApi } from '../../core/api/content-api';
import { HomepageDto, ProjectDto, RequestState, ServiceDto } from '../../core/api/contracts';
import { HeroSection } from '../../shared/ui/hero-section';
import { SectionHeading } from '../../shared/ui/headings';
import { FeatureCard, ProjectCard, SolutionCard } from '../../shared/ui/cards';
import { ProcessSteps } from '../../shared/ui/process-steps';
import { CTASection } from '../../shared/ui/cta-section';
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/states';
import { SecondaryButton } from '../../shared/ui/buttons';
import { BENEFITS, SOLUTIONS } from './solution-categories';

@Component({ selector: 'app-home', imports: [HeroSection, SectionHeading, FeatureCard, ProjectCard, SolutionCard,
  ProcessSteps, CTASection, EmptyState, ErrorState, LoadingState, SecondaryButton],
  templateUrl: './home.html', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private homepageApi = inject(HomepageApi); private projectsApi = inject(ProjectsApi); private servicesApi = inject(ServicesApi);
  private destroyRef = inject(DestroyRef);
  private homepageRequest?: Subscription; private projectsRequest?: Subscription; private servicesRequest?: Subscription;
  readonly homepage = signal<HomepageDto | null>(null); readonly homepageState = signal<RequestState>('loading');
  readonly projects = signal<ProjectDto[]>([]); readonly projectsState = signal<RequestState>('loading');
  readonly services = signal<ServiceDto[]>([]); readonly servicesState = signal<RequestState>('loading');
  readonly benefits = BENEFITS; readonly solutions = SOLUTIONS;

  ngOnInit(): void { this.loadHomepage(); this.loadProjects(); this.loadServices(); }
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
  loadServices(): void {
    this.servicesRequest?.unsubscribe(); this.servicesState.set('loading');
    this.servicesRequest = this.servicesApi.getServices().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => { this.services.set(value); this.servicesState.set('ready'); }, error: () => this.servicesState.set('error'),
    });
  }
  serviceSummary(title: string): string {
    const normalized = (value: string) => (typeof value === 'string' ? value : '').toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
    const service = this.services().find(item => normalized(item.title) === normalized(title));
    if (service?.description?.trim()) return service.description;
    return this.homepage()?.solutions.find(item => normalized(item.title) === normalized(title))?.description ?? '';
  }
}
