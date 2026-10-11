import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ThemeToggle } from './theme-toggle';
import { MobileNavigation } from './mobile-navigation';
import { Icon } from '../ui/icon';
import { navigation } from './navigation';

@Component({ selector: 'app-site-header', imports: [RouterLink, RouterLinkActive, ThemeToggle, MobileNavigation, Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<header class="site-header"><div class="container header-inner"><a class="brand" routerLink="/" aria-label="TwinPeaks Investment — Home"><img src="/assets/brand/horizontal_lockup.png" alt="TwinPeaks Investment" width="1600" height="1000" referrerpolicy="no-referrer" /></a><nav class="desktop-nav" aria-label="Primary navigation">@for (item of items; track item.path) { <a [routerLink]="item.path" routerLinkActive="active" ariaCurrentWhenActive="page" [routerLinkActiveOptions]="{ exact: item.path === '/' }">{{ item.label }}</a> }</nav><div class="header-actions"><div class="desktop-theme"><app-theme-toggle /></div><a class="button button-primary header-quote" routerLink="/request-quote">Request a Quote <app-icon name="arrow" /></a><button class="icon-button menu-toggle" type="button" aria-controls="mobile-navigation" [attr.aria-expanded]="menuOpen()" aria-label="Open navigation" (click)="menuOpen.set(true)"><app-icon name="menu" /></button></div></div></header><app-mobile-navigation [open]="menuOpen()" (closed)="menuOpen.set(false)" />`,
})
export class SiteHeader {
  readonly items = navigation; readonly menuOpen = signal(false);
  constructor() {
    inject(Router).events.pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.menuOpen.set(false));
  }
}
