import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { Icon, IconName } from './icon';
import { mediaUrl } from '../media';
import { conceptSrcset } from '../solution-editorial';

@Component({ selector: 'app-published-image', imports: [Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (source() && !failed()) { <img [src]="source()" [attr.srcset]="srcset() || null" [attr.sizes]="srcset() ? sizes() : null" [alt]="alt()" [attr.loading]="priority() ? 'eager' : 'lazy'" [attr.fetchpriority]="priority() ? 'high' : 'auto'" decoding="async" width="900" height="560" referrerpolicy="no-referrer" (error)="failed.set(true)" /> } @else { <div class="published-image-fallback"><app-icon [name]="icon()" /><span>{{ fallback() }}</span></div> }`,
})
export class PublishedImage {
  readonly url = input<string | null | undefined>(''); readonly alt = input(''); readonly icon = input<IconName>('image');
  readonly fallback = input('Project image unavailable'); readonly priority = input(false);
  readonly sizes = input('(max-width: 599px) calc(100vw - 40px), (max-width: 900px) 45vw, 400px');
  readonly source = computed(() => mediaUrl(this.url())); readonly failed = linkedSignal({ source: this.source, computation: () => false });
  readonly srcset = computed(() => conceptSrcset(this.source()));
}
