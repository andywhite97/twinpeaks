import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from './icon';

@Component({ selector: 'app-loading-state', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="state-panel loading-state" role="status"><span class="loading-dot" aria-hidden="true"></span><p>{{ message() }}</p></div>`,
})
export class LoadingState { readonly message = input('Loading…'); }

@Component({ selector: 'app-empty-state', imports: [Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="state-panel"><app-icon name="image" /><h3>{{ title() }}</h3><p>{{ message() }}</p></div>`,
})
export class EmptyState { readonly title = input('Nothing to show yet'); readonly message = input(''); }

@Component({ selector: 'app-error-state', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="state-panel error-state" role="alert"><h3>{{ title() }}</h3><p>{{ message() }}</p><button class="button button-secondary" type="button" (click)="retry.emit()">Try again</button></div>`,
})
export class ErrorState { readonly title = input('Unable to load'); readonly message = input('Please try again.'); readonly retry = output<void>(); }
