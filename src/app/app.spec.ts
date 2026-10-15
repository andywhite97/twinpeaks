import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { SeoService } from './core/services/seo.service';
import { AnalyticsService } from './core/services/analytics.service';
import { StructuredDataService } from './core/services/structured-data.service';
import { MetaTrackingService } from './core/services/meta-tracking.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render navigation and footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navigation')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });

  it('excludes private quotation navigation from GA/Meta and token-bearing canonical URLs', () => {
    const events = new Subject<NavigationEnd>();
    const router = { events, url: '/quotations/existing-token', routerState: {
      root: { firstChild: { snapshot: { data: { title: 'Your quotation', robots: 'noindex, nofollow' } } } }
    } } as unknown as Router;
    const seo = jasmine.createSpyObj<SeoService>('seo', ['updateSeoTags', 'updateCanonicalUrl']);
    const ga = jasmine.createSpyObj<AnalyticsService>('ga', ['trackPageView']);
    const schemas = jasmine.createSpyObj<StructuredDataService>('schemas', ['injectOrganizationSchema', 'injectLocalBusinessSchema']);
    const meta = jasmine.createSpyObj<MetaTrackingService>('meta', ['initialize', 'trackPageView']);
    spyOn(window, 'scrollTo');
    const app = new App(router, seo, ga, schemas, meta, 'browser' as unknown as object);
    app.ngOnInit();
    events.next(new NavigationEnd(1, router.url, router.url));
    expect(ga.trackPageView).not.toHaveBeenCalled();
    expect(meta.initialize).not.toHaveBeenCalled();
    expect(meta.trackPageView).not.toHaveBeenCalled();
    expect(seo.updateCanonicalUrl).toHaveBeenCalledOnceWith('https://twinpeaksinvestment.com/quotations');
  });
});
