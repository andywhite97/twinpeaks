import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';

@Component({ selector: 'app-primary-button', imports: [RouterLink, Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a class="button button-primary" [routerLink]="to()"><ng-content /><app-icon name="arrow" /></a>`,
})
export class PrimaryButton { readonly to = input('/request-quote'); }

@Component({ selector: 'app-secondary-button', imports: [RouterLink, Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a class="button button-secondary" [routerLink]="to()"><ng-content /><app-icon name="arrow" /></a>`,
})
export class SecondaryButton { readonly to = input('/solutions'); }
