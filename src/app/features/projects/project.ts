import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { HomepageProject } from '../../shared/models/homepage.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private api: ApiService) {}
  getProjects() { return this.api.get<HomepageProject[]>('projects/'); }
  getProject(slug: string) { return this.api.get<HomepageProject>(`projects/${slug}/`); }
}
