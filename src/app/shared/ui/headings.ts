import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublishedImage } from './published-image';

@Component({ selector: 'app-section-heading', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<header class="section-heading"><div><p class="eyebrow">{{ eyebrow() }}</p><h2>{{ title() }}</h2></div>@if (description()) { <p class="section-description">{{ description() }}</p> }</header>`,
})
export class SectionHeading { readonly eyebrow = input(''); readonly title = input.required<string>(); readonly description = input(''); }

@Component({ selector: 'app-page-header', imports: [RouterLink, PublishedImage], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<header class="page-header" [class.page-header--visual]="image()"><div class="container page-header-layout"><div class="page-header-copy"><nav aria-label="Breadcrumb"><a routerLink="/">Home</a><span aria-hidden="true"> / </span>@if (parentPath()) { <a [routerLink]="parentPath()">{{ parentTitle() }}</a><span aria-hidden="true"> / </span> }<span aria-current="page">{{ title() }}</span></nav><p class="eyebrow">{{ eyebrow() }}</p><h1>{{ title() }}</h1>@if (description()) { <p>{{ description() }}</p> }<ng-content /></div>@if (image()) { <figure class="page-header-visual"><app-published-image [url]="image()" [alt]="imageAlt()" [priority]="true" sizes="(max-width: 900px) calc(100vw - 40px), 580px" />@if (imageCaption()) { <figcaption class="image-caption">{{ imageCaption() }}</figcaption> }</figure> }</div></header>`,
})
export class PageHeader { readonly title = input.required<string>(); readonly eyebrow = input('TwinPeaks Investment'); readonly description = input(''); readonly parentPath = input(''); readonly parentTitle = input(''); readonly image = input(''); readonly imageAlt = input(''); readonly imageCaption = input(''); }
