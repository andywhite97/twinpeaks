import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { Footer } from './shared/components/footer/footer';
import { Navigation } from './shared/components/navigation/navigation';
import { SeoService } from './core/services/seo.service';
import { AnalyticsService } from './core/services/analytics.service';
import { StructuredDataService } from './core/services/structured-data.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(
    private router: Router,
    private seoService: SeoService,
    private analyticsService: AnalyticsService,
    private structuredDataService: StructuredDataService
  ) {}

  ngOnInit() {
    // Inject structured data schemas
    this.structuredDataService.injectOrganizationSchema();
    this.structuredDataService.injectLocalBusinessSchema();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Scroll to top on navigation
        window.scrollTo(0, 0);

        // Update SEO tags from route data
        const routeData = this.router.routerState.root.firstChild?.snapshot.data;
        if (routeData) {
          this.seoService.updateSeoTags({
            title: routeData['title'] || 'Twinpeaks Investment',
            description: routeData['description'] || 'Expert financial advisory and wealth management solutions.',
            keywords: routeData['keywords']
          });

          // Update canonical URL
          const currentUrl = `https://twinpeaksinvestment.com${this.router.url}`;
          this.seoService.updateCanonicalUrl(currentUrl);

          // Track page view with Analytics
          this.analyticsService.trackPageView(this.router.url, routeData['title'] || 'Twinpeaks');
        }
      });
  }
}
