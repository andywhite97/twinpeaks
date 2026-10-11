import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { Home } from './home';
import { HomepageApi, ProjectsApi, ServicesApi } from '../../core/api/content-api';
import { HomepageDto, ProjectDto, ServiceDto } from '../../core/api/contracts';

describe('Homepage content integrity and recovery', () => {
  let projects: Subject<ProjectDto[]>;
  beforeEach(() => {
    projects = new Subject();
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      { provide: ProjectsApi, useValue: { getFeaturedProjects: () => projects } },
      { provide: HomepageApi, useValue: { getHomepage: () => new Subject<HomepageDto>() } },
      { provide: ServicesApi, useValue: { getServices: () => new Subject<ServiceDto[]>() } },
    ] });
  });
  it('shows loading and an honest empty portfolio', () => {
    const fixture = TestBed.createComponent(Home); fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('Loading published projects');
    projects.next([]); fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('No featured projects published yet');
    expect(fixture.nativeElement.querySelectorAll('app-solution-card').length).toBe(6);
  });
  it('shows errors without fabricating projects and supports retry', () => {
    const fixture = TestBed.createComponent(Home); fixture.detectChanges(); projects.error(new Error('Offline')); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Projects are temporarily unavailable');
    projects = new Subject(); fixture.componentInstance.loadProjects(); projects.next([]); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No featured projects published yet');
  });
  it('cancels project requests when leaving the page', () => {
    const fixture = TestBed.createComponent(Home); fixture.detectChanges(); expect(projects.observed).toBeTrue(); fixture.destroy(); expect(projects.observed).toBeFalse();
  });
});
