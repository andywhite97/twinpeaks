import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageHeader, SectionHeading } from '../../shared/ui/headings';
import { ProcessSteps } from '../../shared/ui/process-steps';
import { CTASection } from '../../shared/ui/cta-section';
import { ErrorState, LoadingState } from '../../shared/ui/states';
import { Icon } from '../../shared/ui/icon';
import { mappedService, SOLUTION_CONFIGS } from './solution-config';
import { ServiceCatalog } from './service-catalog';
import { BENEFITS } from '../home/solution-categories';
import { FeatureCard, SolutionCard } from '../../shared/ui/cards';

@Component({ selector: 'app-solutions', imports: [PageHeader, SectionHeading, ProcessSteps, CTASection, ErrorState, LoadingState, Icon, FeatureCard, SolutionCard], templateUrl: './solutions.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class Solutions {
  readonly solutions = SOLUTION_CONFIGS; readonly catalog = inject(ServiceCatalog); readonly serviceFor = mappedService;
  readonly benefits = BENEFITS;
  readonly applications = ['Offices & workspaces', 'Retail & hospitality', 'Homes & shared spaces', 'Connected operations'];
  constructor() { this.catalog.ensureLoaded(); }
}
