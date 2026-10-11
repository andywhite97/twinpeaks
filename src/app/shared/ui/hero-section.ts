import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { PrimaryButton, SecondaryButton } from './buttons';
import { Icon } from './icon';

@Component({ selector: 'app-hero-section', imports: [PrimaryButton, SecondaryButton, Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="hero-section container" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow hero-eyebrow"><span></span>Technology · Security · Digital Solutions</p><h1 id="hero-title">Built on Vision,<br><span>Driven by Progress.</span></h1><p class="hero-description">{{ description() }}</p><div class="hero-actions"><app-primary-button to="/solutions">Explore Solutions</app-primary-button><app-secondary-button to="/request-quote">Request a Quote</app-secondary-button></div><p class="hero-location"><app-icon name="pin" />Technology for businesses and communities in Eswatini</p></div><div class="hero-visual">@if (!imageFailed()) { <img src="/assets/images/technology-concept.webp" srcset="/assets/images/technology-concept-small.webp 560w, /assets/images/technology-concept.webp 1120w" sizes="(max-width: 900px) calc(100vw - 40px), 580px" alt="Conceptual arrangement of security, point-of-sale and networking technology" width="1536" height="1024" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" (error)="imageFailed.set(true)" /> } @else { <div class="hero-image-fallback"><app-icon name="network" /><p>Technology. Connected.</p></div> }<div class="visual-caption"><span class="visual-marker" aria-hidden="true"></span><span>Connected technology. Practical solutions.</span></div></div></section>`,
})
export class HeroSection {
  readonly description = input('Technology, security systems and digital solutions that connect your business to what comes next. From installation to ongoing support, TwinPeaks brings your systems together.');
  readonly imageFailed = signal(false);
}
