import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '../../shared/ui/headings';
import { SecondaryButton } from '../../shared/ui/buttons';

@Component({ selector: 'app-not-found', imports: [PageHeader, SecondaryButton], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-header title="Page not found" eyebrow="404" description="The page you’re looking for isn’t here." /><section class="section container"><div class="preview-panel"><h2>Let’s get you back on track.</h2><p>Return to the homepage to explore TwinPeaks solutions.</p><app-secondary-button to="/">Return to Home</app-secondary-button></div></section>`,
})
export class NotFound {}
