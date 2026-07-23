import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  
  /**
   * Initialize Google Analytics
   * Add this script to index.html head:
   * <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
   * <script>
   *   window.dataLayer = window.dataLayer || [];
   *   function gtag(){dataLayer.push(arguments);}
   *   gtag('js', new Date());
   *   gtag('config', 'YOUR_GA_ID');
   * </script>
   */

  trackPageView(path: string, title: string): void {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
          page_path: path,
          page_title: title
        });
      }
    } catch (error) {
      console.log('Analytics not initialized');
    }
  }

  trackEvent(eventName: string, eventData: any = {}): void {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
      }
    } catch (error) {
      console.log('Analytics not initialized');
    }
  }

  trackConversion(conversionId: string, label: string): void {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
          'allow_custom_scripts': true,
          'conversion_id': conversionId,
          'conversion_label': label
        });
      }
    } catch (error) {
      console.log('Conversion tracking not initialized');
    }
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
