import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageContent } from '../../core/seo/page-resolvers';
import { PageHeader, SectionHeading } from '../../shared/ui/headings';
import { ErrorState } from '../../shared/ui/states';
import { ProjectGallery } from './project-gallery';
import { RelatedProjects } from './related-projects';
import { NotFound } from '../not-found/not-found';

export function validCompletionDate(value: string | null | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + 'T00:00:00Z'); return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}
@Component({ selector: 'app-project-detail', imports: [DatePipe, RouterLink, PageHeader, SectionHeading, ErrorState, ProjectGallery, RelatedProjects, NotFound], templateUrl: './project-detail.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class ProjectDetail {
  private route = inject(ActivatedRoute); private router = inject(Router);
  readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  readonly content = computed(() => this.data()['content'] as PageContent); readonly project = computed(() => this.content().project);
  readonly completionDate = computed(() => validCompletionDate(this.project()?.completion_date));
  retry(): void { void this.router.navigateByUrl(this.router.url, { onSameUrlNavigation: 'reload' }); }
}
