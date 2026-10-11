import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { Home } from './home';
import { HomepageApi, ProjectsApi, SolutionsApi } from '../../core/api/content-api';
import { HomepageDto, ProjectDto, SolutionDto } from '../../core/api/contracts';
import { Solutions } from '../solutions/solutions';

describe('Homepage content integrity and recovery', () => {
  let projects: Subject<ProjectDto[]>;
  let services: Subject<SolutionDto[]>;
  beforeEach(() => {
    projects = new Subject();
    services = new Subject();
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      { provide: ProjectsApi, useValue: { getFeaturedProjects: () => projects } },
      { provide: HomepageApi, useValue: { getHomepage: () => new Subject<HomepageDto>() } },
      { provide: SolutionsApi, useValue: { getSolutions: () => services } },
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
  it('uses the uploaded service image on its matching solution card', () => {
    const fixture = TestBed.createComponent(Home); fixture.detectChanges();
    services.next([{ id: 12, title: 'Surveillance and Alarm Systems', description: 'Published', icon: null, image: '/media/services/images/security.png' }]);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('app-solution-card');
    expect(card.querySelector('img').getAttribute('src')).toContain('/media/services/images/security.png');
    expect(card.querySelector('img').getAttribute('alt')).toBe('Surveillance & Alarm Systems');
    expect(card.querySelector('.image-caption').textContent.trim()).toBe('Solution image');
    expect(card.querySelector('img').hasAttribute('srcset')).toBeFalse();
  });
  it('retains concept imagery when the backend image is absent or removed', () => {
    const fixture = TestBed.createComponent(Home); fixture.detectChanges();
    const service: SolutionDto = { id: 12, title: 'Surveillance & Alarm Systems', description: 'Published', icon: null, image: '/media/services/images/security.png' };
    services.next([service]); fixture.detectChanges();
    services.next([{ ...service, image: null }]); fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('app-solution-card');
    expect(card.querySelector('img').getAttribute('src')).toBe('/assets/images/surveillance-alarm-systems-concept-v1.webp');
    expect(card.querySelector('img').getAttribute('srcset')).toContain('-small.webp 560w');
    expect(card.querySelector('.image-caption')).toBeNull();
  });
  it('does not select an image from ambiguous service titles', () => {
    const fixture = TestBed.createComponent(Home); fixture.detectChanges();
    const service: SolutionDto = { id: 12, title: 'Surveillance & Alarm Systems', description: 'Published', icon: null, image: '/media/services/images/security.png' };
    services.next([service, { ...service, id: 13 }]); fixture.detectChanges();
    expect(fixture.componentInstance.solutionImage(service.title)).toBeNull();
  });
  it('shares published solution descriptions and images with the solutions page', () => {
    const home = TestBed.createComponent(Home); home.detectChanges();
    services.next([{ id: 12, title: 'Surveillance and Alarm Systems', description: 'Shared published scope', icon: null, image: '/media/solutions/images/security.png' }]);
    home.detectChanges();
    const page = TestBed.createComponent(Solutions); page.detectChanges();
    expect(page.componentInstance.catalog).toBe(home.componentInstance.catalog);
    for (const fixture of [home, page]) {
      const card = fixture.nativeElement.querySelector('app-solution-card');
      expect(card.textContent).toContain('Shared published scope');
      expect(card.querySelector('img').getAttribute('src')).toContain('/media/solutions/images/security.png');
    }
  });
});
