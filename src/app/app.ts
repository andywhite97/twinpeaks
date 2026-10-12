import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CompanyStore } from './core/state/company-store';
import { SeoService } from './core/seo/seo.service';
import { ThemeService } from './core/theme/theme.service';
import { SiteHeader } from './shared/layout/site-header';
import { SiteFooter } from './shared/layout/site-footer';
import { ToastNotification } from './shared/ui/toast-notification';
import { PageContent } from './core/seo/page-resolvers';
import { mediaUrl } from './shared/media';
import { LoadingStore } from './core/state/loading-store';
import { FullScreenLoader } from './shared/ui/full-screen-loader';

@Component({ selector: 'app-root', imports: [RouterOutlet, SiteHeader, SiteFooter, ToastNotification, FullScreenLoader],
  template: `<a class="skip-link" href="#main-content">Skip to content</a><app-site-header /><main id="main-content" tabindex="-1" [attr.aria-busy]="busy()"><router-outlet /></main><app-site-footer /><app-toast-notification />@if (loaderVisible()) { <app-full-screen-loader /> }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly navigating = signal(false);
  private readonly loading = inject(LoadingStore);
  readonly busy = computed(() => this.navigating() || this.loading.busy());
  readonly loaderVisible = signal(false);
  private theme = inject(ThemeService);
  constructor() {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    effect(onCleanup => {
      if (!browser) return;
      if (!this.busy()) { this.loaderVisible.set(false); return; }
      // Quick cached requests finish without flashing the full-screen overlay.
      const timer = setTimeout(() => this.loaderVisible.set(true), 150);
      onCleanup(() => clearTimeout(timer));
    });
    inject(CompanyStore).load();
    const router = inject(Router); const seo = inject(SeoService);
    router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(event => {
      if (event instanceof NavigationStart) this.navigating.set(true);
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) this.navigating.set(false);
      if (!(event instanceof NavigationEnd)) return;
      const data = router.routerState.root.firstChild?.snapshot.data ?? {};
      const content = data['content'] as PageContent | undefined;
      seo.update(router.url, content?.title ?? data['title'] ?? 'TwinPeaks Investment',
        content?.description ?? data['description'] ?? 'Technology, security and digital solutions in Eswatini.', content?.noindex ?? data['noindex'] ?? false,
        content?.breadcrumbs ?? data['breadcrumbs'] ?? [], mediaUrl(content?.project?.image));
    });
  }
}
