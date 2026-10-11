import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { ProjectDto } from '../../core/api/contracts';
import { PublishedImage } from '../../shared/ui/published-image';
import { Icon } from '../../shared/ui/icon';
import { mediaUrl } from '../../shared/media';

export function galleryImages(project: ProjectDto): { url: string; caption: string }[] {
  const images = [{ url: project.image, caption: project.title }, ...(project.images ?? []).slice().sort((a, b) => a.display_order - b.display_order).map(image => ({ url: image.image, caption: image.caption || project.title }))];
  const seen = new Set<string>(); return images.filter(image => { const source = mediaUrl(image.url); if (!source || seen.has(source)) return false; seen.add(source); return true; });
}
@Component({ selector: 'app-project-gallery', imports: [PublishedImage, Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="project-gallery" aria-label="Project gallery" (keydown)="onKey($event)">@if (images().length) { <figure><app-published-image [url]="current()?.url" [alt]="current()?.caption || project().title" [priority]="true" /><figcaption>{{ current()?.caption }}<span role="status">Image {{ selected() + 1 }} of {{ images().length }}</span></figcaption></figure>@if (images().length > 1) { <div class="gallery-controls"><button class="icon-button" type="button" aria-label="Previous project image" [disabled]="selected() === 0" (click)="move(-1)"><app-icon name="arrow" /></button><div class="gallery-selectors" role="group" aria-label="Choose project image">@for (image of images(); track image.url; let index = $index) { <button type="button" class="filter-button" [attr.aria-label]="'Show image ' + (index + 1) + ': ' + image.caption" [attr.aria-pressed]="index === selected()" (click)="selected.set(index)">{{ index + 1 }}</button> }</div><button class="icon-button" type="button" aria-label="Next project image" [disabled]="selected() === images().length - 1" (click)="move(1)"><app-icon name="arrow" /></button></div> } } @else { <app-published-image fallback="No project images published" /> }</section>`,
})
export class ProjectGallery {
  readonly project = input.required<ProjectDto>(); readonly images = computed(() => galleryImages(this.project()));
  readonly selected = linkedSignal({ source: this.images, computation: () => 0 }); readonly current = computed<{ url: string; caption: string } | undefined>(() => this.images()[this.selected()]);
  move(direction: number): void { this.selected.update(index => Math.max(0, Math.min(this.images().length - 1, index + direction))); }
  onKey(event: KeyboardEvent): void { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); this.move(event.key === 'ArrowRight' ? 1 : -1); } }
}
