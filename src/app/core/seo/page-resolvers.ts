import { inject, RESPONSE_INIT } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { ProjectsApi } from '../api/content-api';
import { ProjectDto } from '../api/contracts';
import { SOLUTION_CONFIGS, SolutionConfig } from '../../features/solutions/solution-config';

export interface PageContent {
  state: 'ready' | 'not-found' | 'error';
  title: string; description: string; noindex?: boolean;
  project?: ProjectDto; solution?: SolutionConfig;
  breadcrumbs: { name: string; path: string }[];
}
export const notFoundResolver: ResolveFn<PageContent> = () => {
  const response = inject(RESPONSE_INIT, { optional: true });
  if (response) response.status = 404;
  return { state: 'not-found', title: 'Page Not Found | TwinPeaks Investment', description: 'The requested page could not be found.', noindex: true, breadcrumbs: [] };
};
export const solutionResolver: ResolveFn<PageContent> = route => {
  const response = inject(RESPONSE_INIT, { optional: true });
  const solution = SOLUTION_CONFIGS.find(item => item.slug === route.paramMap.get('slug'));
  if (!solution) { if (response) response.status = 404; return { state: 'not-found', title: 'Solution Not Found | TwinPeaks Investment', description: 'The requested solution could not be found.', noindex: true, breadcrumbs: [] }; }
  return { state: 'ready', solution, title: `${solution.title} | TwinPeaks Investment`, description: solution.summary,
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Solutions', path: '/solutions' }, { name: solution.title, path: `/solutions/${solution.slug}` }] };
};
export const projectResolver: ResolveFn<PageContent> = route => {
  const response = inject(RESPONSE_INIT, { optional: true });
  const slug = route.paramMap.get('slug') ?? '';
  return inject(ProjectsApi).getProject(slug).pipe(map(project => ({ state: 'ready' as const, project,
    title: `${project.title} | TwinPeaks Projects`, description: project.short_description || 'A published TwinPeaks Investment project.',
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Projects', path: '/projects' }, { name: project.title, path: `/projects/${encodeURIComponent(slug)}` }],
  })), catchError((error: HttpErrorResponse) => {
    const missing = error.status === 404;
    if (response) response.status = missing ? 404 : 503;
    return of({ state: missing ? 'not-found' as const : 'error' as const, title: `${missing ? 'Project Not Found' : 'Project Unavailable'} | TwinPeaks Investment`,
      description: missing ? 'The requested project could not be found.' : 'The project could not load. Please try again.', noindex: true, breadcrumbs: [] });
  }));
};
