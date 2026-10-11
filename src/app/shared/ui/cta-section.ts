import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PrimaryButton } from './buttons';

@Component({ selector: 'app-cta-section', imports: [PrimaryButton], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="cta-section container" aria-labelledby="final-cta-title"><div><p class="eyebrow">Ready for your next step?</p><h2 id="final-cta-title">{{ title() }}</h2><p>{{ description() }}</p></div><app-primary-button>Request a Quote</app-primary-button></section>`,
})
export class CTASection {
  readonly title = input('Let’s build a smarter, safer tomorrow.');
  readonly description = input('Tell us what you need. Let’s find the right technology for your business.');
}
