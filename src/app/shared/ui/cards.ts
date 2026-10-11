import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectDto } from '../../core/api/contracts';
import { mediaUrl } from '../media';
import { Icon, IconName } from './icon';
import { PublishedImage } from './published-image';
import { conceptUrl, solutionEditorial } from '../solution-editorial';

export interface SolutionPresentation { slug: string; title: string; summary: string; icon: IconName; }
export interface FeaturePresentation { title: string; description: string; icon: IconName; }

@Component({ selector: 'app-feature-card', imports: [Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article class="feature-card"><span class="feature-icon"><app-icon [name]="feature().icon" /></span><div><h3>{{ feature().title }}</h3><p>{{ feature().description }}</p></div></article>`,
})
export class FeatureCard { readonly feature = input.required<FeaturePresentation>(); }

@Component({ selector: 'app-solution-card', imports: [Icon, RouterLink, PublishedImage], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article class="solution-card media-solution" [class.detailed-solution]="detailed()">@if (editorial(); as visual) { <div class="solution-media"><app-published-image [url]="imageUrl(visual.image)" [alt]="visual.alt" [icon]="solution().icon" fallback="Technology concept unavailable" /><span class="image-caption">Concept visual</span><span class="solution-icon"><app-icon [name]="solution().icon" /></span></div> }<div class="solution-card-body"><h3><a [routerLink]="['/solutions', solution().slug]">{{ solution().title }}</a></h3><p>{{ summary() || solution().summary }}</p>@if (detailed()) { <ul class="capability-list">@for (capability of capabilities(); track capability) { <li><app-icon name="check" />{{ capability }}</li> }</ul> }<a class="text-link" [routerLink]="['/solutions', solution().slug]" [attr.aria-label]="'Explore ' + solution().title">Explore solution <app-icon name="arrow" /></a></div></article>`,
})
export class SolutionCard { readonly solution = input.required<SolutionPresentation>(); readonly summary = input(''); readonly detailed = input(false); readonly capabilities = input<readonly string[]>([]); readonly editorial = computed(() => solutionEditorial(this.solution().slug)); readonly imageUrl = conceptUrl; }

@Component({ selector: 'app-project-card', imports: [Icon, RouterLink], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article class="project-card">@if (source() && !failed()) { <img [src]="source()" [alt]="project().title" width="700" height="440" loading="lazy" decoding="async" referrerpolicy="no-referrer" (error)="failed.set(true)" /> } @else { <div class="project-image-placeholder"><app-icon name="image" /><span>Project image unavailable</span></div> }<div class="project-card-content">@if (project().category) { <p class="eyebrow">{{ project().category }}</p> }<h3><a [routerLink]="['/projects', project().slug]">{{ project().title }}</a></h3>@if (project().short_description) { <p>{{ project().short_description }}</p> }<a class="text-link" [routerLink]="['/projects', project().slug]" [attr.aria-label]="'View project: ' + project().title">View project <app-icon name="arrow" /></a></div></article>`,
})
export class ProjectCard {
  readonly project = input.required<ProjectDto>(); readonly failed = linkedSignal({ source: () => this.project().image, computation: () => false });
  readonly source = computed(() => mediaUrl(this.project().image));
}
