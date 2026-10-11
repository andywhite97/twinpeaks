import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyStore } from '../../core/state/company-store';
import { PageHeader } from '../../shared/ui/headings';
import { SecondaryButton } from '../../shared/ui/buttons';
import { phoneHref } from '../../shared/media';
import { SOLUTIONS } from '../home/solution-categories';

@Component({ selector: 'app-page-shell', imports: [PageHeader, SecondaryButton],
  template: `<app-page-header [title]="title()" description="TwinPeaks Investment" /><section class="section container"><article class="preview-panel"><p class="eyebrow">Legal copy awaiting approval</p><h2>Approved {{ title().toLowerCase() }} information is pending.</h2><p>This layout is a preview. Company-approved legal copy must be supplied before this page is finalized.</p>@if (company.profile(); as profile) { <div class="preview-contact">@if (profile.email) { <a class="text-link" [href]="'mailto:' + profile.email">{{ profile.email }}</a> }@if (phoneLink(profile.phone); as href) { <a class="text-link" [href]="href">{{ profile.phone }}</a> }</div> }<app-secondary-button to="/contact">Contact TwinPeaks</app-secondary-button></article></section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageShell {
  private route = inject(ActivatedRoute);
  readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly company = inject(CompanyStore); readonly phoneLink = phoneHref;
  readonly title = computed(() => this.data()['shell'] === 'solution'
    ? SOLUTIONS.find(solution => solution.slug === this.params().get('slug'))?.title ?? 'Solution'
    : this.data()['heading'] ?? 'TwinPeaks Investment');
}
