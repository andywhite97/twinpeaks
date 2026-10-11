import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageContent } from '../../core/seo/page-resolvers';
import { PageHeader, SectionHeading } from '../../shared/ui/headings';
import { ProcessSteps } from '../../shared/ui/process-steps';
import { Icon } from '../../shared/ui/icon';
import { conceptUrl, solutionEditorial } from '../../shared/solution-editorial';
import { ErrorState, LoadingState } from '../../shared/ui/states';
import { RelatedProjects } from '../projects/related-projects';
import { NotFound } from '../not-found/not-found';
import { SolutionCatalog } from './solution-catalog';
import { mappedSolutionRecord } from './solution-config';

@Component({ selector: 'app-solution-detail', imports: [RouterLink, PageHeader, SectionHeading, ProcessSteps, Icon, ErrorState, LoadingState, RelatedProjects, NotFound], templateUrl: './solution-detail.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class SolutionDetail {
  private route = inject(ActivatedRoute); readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  readonly solution = computed(() => (this.data()['content'] as PageContent).solution);
  readonly catalog = inject(SolutionCatalog);
  readonly imageUrl = conceptUrl;
  readonly editorial = computed(() => solutionEditorial(this.solution()?.slug ?? ''));
  readonly record = computed(() => { const solution = this.solution(); return solution ? mappedSolutionRecord(solution, this.catalog.records()) : null; });
  constructor() { this.catalog.ensureLoaded(); }
}
