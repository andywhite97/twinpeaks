import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompanyStore } from '../../core/state/company-store';
import { SOLUTIONS } from '../../features/home/solution-categories';
import { navigation } from './navigation';
import { phoneHref } from '../media';
import { Icon } from '../ui/icon';

@Component({ selector: 'app-site-footer', imports: [RouterLink, Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><a class="brand" routerLink="/" aria-label="TwinPeaks Investment — Home"><img src="/assets/brand/horizontal_lockup.png" alt="TwinPeaks Investment" width="1600" height="1000" loading="lazy" referrerpolicy="no-referrer" /></a><p>Technology, security and digital solutions for a more connected Eswatini.</p></div><div><h2>Explore</h2><ul>@for (item of items; track item.path) { <li><a [routerLink]="item.path">{{ item.label }}</a></li> }</ul></div><div><h2>Our Solutions</h2><ul>@for (solution of solutions; track solution.slug) { <li><a [routerLink]="['/solutions', solution.slug]">{{ solution.title }}</a></li> }</ul></div><div class="footer-contact"><h2>Get in touch</h2>@if (company.profile(); as profile) { @if (profile.phone) { <p><app-icon name="phone" />@if (phoneLink(profile.phone); as href) { <a [href]="href">{{ profile.phone }}</a> } @else { <span>{{ profile.phone }}</span> }</p> }@if (profile.email) { <p><app-icon name="mail" /><a [href]="'mailto:' + profile.email">{{ profile.email }}</a></p> }@if (profile.address) { <p><app-icon name="pin" /><span>{{ profile.address }}</span></p> }@if (profile.business_hours) { <p><app-icon name="clock" /><span>{{ profile.business_hours }}</span></p> }@if (!profile.email && !profile.phone && !profile.address) { <p>Contact details have not been published yet.</p> } } @else if (company.status() === 'loading') { <p role="status">Loading company details…</p> } @else { <p>Contact information is unavailable right now.</p><button class="text-button" type="button" (click)="company.load()">Retry company details</button> }</div></div><div class="container footer-bottom"><p>{{ company.profile()?.copyright_text || ('© ' + year + ' TwinPeaks Investment.') }}</p><nav aria-label="Legal"><a routerLink="/privacy">Privacy</a><a routerLink="/terms">Terms</a></nav><p class="footer-tagline">Built on Vision, Driven by Progress.</p></div></footer>`,
})
export class SiteFooter {
  readonly company = inject(CompanyStore); readonly solutions = SOLUTIONS; readonly items = navigation;
  readonly year = new Date().getFullYear(); readonly phoneLink = phoneHref;
}
