import { TestBed } from '@angular/core/testing';
import { RESPONSE_INIT } from '@angular/core';
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { ProjectsApi } from '../api/content-api';
import { notFoundResolver, PageContent, projectResolver, solutionResolver } from './page-resolvers';
import { ProjectDto } from '../api/contracts';
describe('SSR detail resolution', () => {
  let response: ResponseInit; let api: jasmine.SpyObj<ProjectsApi>;
  const route = (slug: string) => ({ paramMap: convertToParamMap({ slug }) } as ActivatedRouteSnapshot);
  beforeEach(() => { response = {}; api = jasmine.createSpyObj('ProjectsApi', ['getProject']); TestBed.configureTestingModule({ providers: [{ provide: RESPONSE_INIT, useValue: response }, { provide: ProjectsApi, useValue: api }] }); });
  it('returns HTTP 404 and noindex for any unknown URL without a redirect', () => {
    const result = TestBed.runInInjectionContext(() => notFoundResolver(route('missing'), {} as RouterStateSnapshot)) as PageContent;
    expect(response.status).toBe(404); expect(result.noindex).toBeTrue(); expect(result.state).toBe('not-found');
  });
  it('returns HTTP 404 and noindex for an unknown solution', () => {
    const result = TestBed.runInInjectionContext(() => solutionResolver(route('unknown'), {} as RouterStateSnapshot)) as PageContent;
    expect(response.status).toBe(404); expect(result.noindex).toBeTrue();
  });
  it('maps project metadata from the actual record', () => {
    api.getProject.and.returnValue(of({ title: 'Published title', slug: 'published', short_description: 'Published summary' } as ProjectDto));
    const result = TestBed.runInInjectionContext(() => projectResolver(route('published'), {} as RouterStateSnapshot)) as Observable<PageContent>;
    result.subscribe(content => { expect(content.title).toContain('Published title'); expect(content.description).toBe('Published summary'); expect(content.breadcrumbs[2]?.path).toBe('/projects/published'); });
  });
  for (const status of [404, 503]) it(`distinguishes missing projects from availability errors (${status})`, () => {
    api.getProject.and.returnValue(throwError(() => new HttpErrorResponse({ status })));
    const result = TestBed.runInInjectionContext(() => projectResolver(route('missing'), {} as RouterStateSnapshot)) as Observable<PageContent>;
    result.subscribe(content => { expect(content.state).toBe(status === 404 ? 'not-found' : 'error'); expect(content.noindex).toBeTrue(); expect(response.status).toBe(status); });
  });
});
