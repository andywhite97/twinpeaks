import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { Footer } from './shared/components/footer/footer';
import { Navigation } from './shared/components/navigation/navigation';
import { SeoService } from './core/services/seo.service';
import { AnalyticsService } from './core/services/analytics.service';
import { StructuredDataService } from './core/services/structured-data.service';
import { MetaTrackingService } from './core/services/meta-tracking.service';
import { ToastNotifications } from './shared/components/toast-notifications/toast-notifications';
import { filter } from 'rxjs/operators';
import { containsPrivateQuotation } from './core/services/tracking-privacy.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, Footer, ToastNotifications],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(
    private router: Router,
    private seoService: SeoService,
    private analyticsService: AnalyticsService,
    private structuredDataService: StructuredDataService,
    private metaTracking: MetaTrackingService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    // Inject structured data schemas
    this.structuredDataService.injectOrganizationSchema();
    this.structuredDataService.injectLocalBusinessSchema();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Scroll to top on navigation
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo(0, 0);
        }

        // Update SEO tags from route data
        const routeData = this.router.routerState.root.firstChild?.snapshot.data;
        if (routeData) {
          this.seoService.updateSeoTags({
            title: routeData['title'] || 'Twinpeaks Investment',
            description: routeData['description'] || 'Expert financial advisory and wealth management solutions.',
            keywords: routeData['keywords'],
            robots: routeData['robots'],
          });

          // Update canonical URL
          const privatePage = containsPrivateQuotation(this.router.url);
          const currentUrl = privatePage ? 'https://twinpeaksinvestment.com/quotations'
            : `https://twinpeaksinvestment.com${this.router.url.split(/[?#]/)[0]}`;
          this.seoService.updateCanonicalUrl(currentUrl);

          // Track page view with Analytics
          if (isPlatformBrowser(this.platformId) && !privatePage) {
          this.analyticsService.trackPageView(this.router.url, routeData['title'] || 'Twinpeaks');
          this.metaTracking.trackPageView(`https://twinpeaksinvestment.com${this.router.url}`);
          }
        }
      });
  }
}
