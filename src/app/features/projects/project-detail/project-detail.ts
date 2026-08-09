import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Loader } from '../../../shared/components/loader/loader';
import { HomepageProject } from '../../../shared/models/homepage.model';
import { ProjectService } from '../project';
import { OptimizedImagePipe } from '../../../shared/pipes/optimized-image.pipe';

@Component({ standalone: true, selector: 'app-project-detail', imports: [RouterLink, PageHeader, Loader, OptimizedImagePipe], templateUrl: './project-detail.html', styleUrl: './project-detail.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class ProjectDetail implements OnInit {
  project?: HomepageProject; isLoading = true; hasError = false;
  constructor(private route: ActivatedRoute, private projectService: ProjectService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { const slug = this.route.snapshot.paramMap.get('slug'); if (!slug) { this.hasError = true; this.isLoading = false; return; } this.projectService.getProject(slug).subscribe({ next: (project) => { this.project = project; this.isLoading = false; this.cdr.markForCheck(); }, error: () => { this.hasError = true; this.isLoading = false; this.cdr.markForCheck(); } }); }
}
