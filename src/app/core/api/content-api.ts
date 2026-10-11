import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClient } from './api-client';
import { CompanyProfile, ContactRequest, ContactResponse, HomepageDto, ProjectDto, SolutionDto } from './contracts';

@Injectable({ providedIn: 'root' })
export class CompanyApi {
  private api = inject(ApiClient);
  getCompany() { return this.api.get<CompanyProfile | null>('company/'); }
}
@Injectable({ providedIn: 'root' })
export class SolutionsApi {
  private api = inject(ApiClient);
  getSolutions() { return this.api.get<SolutionDto[] | null>('solutions/').pipe(map(data => Array.isArray(data) ? data : [])); }
}
@Injectable({ providedIn: 'root' })
export class ProjectsApi {
  private api = inject(ApiClient);
  getProjects() { return this.api.get<ProjectDto[] | null>('projects/').pipe(map(data => Array.isArray(data) ? data : [])); }
  getFeaturedProjects() { return this.api.get<ProjectDto[] | null>('projects/?featured=true').pipe(map(data => Array.isArray(data) ? data : [])); }
  getProject(slug: string) { return this.api.get<ProjectDto>(`projects/${encodeURIComponent(slug)}/`); }
}
@Injectable({ providedIn: 'root' })
export class HomepageApi {
  private api = inject(ApiClient);
  getHomepage() {
    return this.api.get<HomepageDto | null>('homepage/').pipe(map(data => ({
      hero: data?.hero ?? {}, settings: data?.settings ?? data?.hero ?? {},
      solutions: Array.isArray(data?.solutions) ? data.solutions : [], projects: Array.isArray(data?.projects) ? data.projects : [],
    } satisfies HomepageDto)));
  }
}
@Injectable({ providedIn: 'root' })
export class ContactApi {
  private api = inject(ApiClient);
  sendEnquiry(request: ContactRequest) { return this.api.post<ContactResponse>('contact/', request); }
}
