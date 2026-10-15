import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { publicPageUrl, TrackingPrivacyService } from './tracking-privacy.service';

declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; } }

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private initialized = false;
  constructor(private privacy: TrackingPrivacyService) {}

  private initialize(): void {
    if (this.initialized || !this.privacy.canTrack()) return;
    this.initialized = true;
    window.dataLayer ??= [];
    window.gtag ??= (...args: unknown[]) => { window.dataLayer!.push(args); };
    window.gtag('js', new Date());
    window.gtag('config', environment.gaId, {
      send_page_view: false, page_location: publicPageUrl(window.location.href), page_referrer: '',
      allow_google_signals: false, allow_ad_personalization_signals: false,
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(environment.gaId)}`;
    script.dataset['twinpeaksAnalytics'] = 'true';
    document.head.appendChild(script);
  }
  
  // Keep the vendor script out of index.html: private documents must never load it.

  trackPageView(path: string, title: string): void {
    if (!this.privacy.canTrack({ path, title })) return;
    this.trackEvent('page_view', { page_path: new URL(publicPageUrl(path)).pathname, page_title: title });
  }

  trackEvent(eventName: string, eventData: any = {}): void {
    if (!this.privacy.canTrack({ eventName, eventData })) return;
    try {
      this.initialize();
      window.gtag?.('event', eventName, { ...eventData,
        page_location: publicPageUrl(window.location.href), page_referrer: '' });
    } catch (error) {
      console.log('Analytics not initialized');
    }
  }

  trackConversion(conversionId: string, label: string): void {
    this.trackEvent('conversion', { conversion_id: conversionId, conversion_label: label });
  }

  trackFormSubmission(formName: string): void {
    this.trackEvent('form_submit', {
      form_name: formName
    });
  }

  trackProductView(productId: string, productName: string, value?: number): void {
    this.trackEvent('view_item', {
      items: [
        {
          item_id: productId,
          item_name: productName,
          value: value || 0
        }
      ]
    });
  }

  trackServiceClick(serviceName: string): void {
    this.trackEvent('service_click', {
      service_name: serviceName
    });
  }

  trackContactAttempt(): void {
    this.trackEvent('contact_initiated');
  }
}
