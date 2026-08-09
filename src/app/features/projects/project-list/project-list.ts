import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Loader } from '../../../shared/components/loader/loader';
import { HomepageProject } from '../../../shared/models/homepage.model';
import { ProjectService } from '../project';
import { OptimizedImagePipe } from '../../../shared/pipes/optimized-image.pipe';

@Component({ standalone: true, selector: 'app-project-list', imports: [RouterLink, PageHeader, Loader, OptimizedImagePipe], templateUrl: './project-list.html', styleUrl: './project-list.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class ProjectList implements OnInit {
  projects: HomepageProject[] = []; isLoading = true; hasError = false;
  constructor(private projectService: ProjectService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.projectService.getProjects().subscribe({ next: (projects) => { this.projects = projects; this.isLoading = false; this.cdr.markForCheck(); }, error: () => { this.hasError = true; this.isLoading = false; this.cdr.markForCheck(); } }); }
}
