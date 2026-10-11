import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
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

@Component({ selector: 'app-root', imports: [RouterOutlet, SiteHeader, SiteFooter, ToastNotification],
  template: `<a class="skip-link" href="#main-content">Skip to content</a><app-site-header />@if (navigating()) { <div class="route-loading" role="status">Loading page…</div> }<main id="main-content" tabindex="-1"><router-outlet /></main><app-site-footer /><app-toast-notification />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly navigating = signal(false);
  private theme = inject(ThemeService);
  constructor() {
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
