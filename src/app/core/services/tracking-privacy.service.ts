import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

/** Also catches encoded quotation links embedded in an event/query parameter. */
export function containsPrivateQuotation(value: unknown): boolean {
  if (typeof value === 'string') {
    let decoded = value;
    for (let i = 0; i < 3; i++) {
      if (/\/quotations\/[^\s?#]+/i.test(decoded)) return true;
      try { const next = decodeURIComponent(decoded); if (next === decoded) break; decoded = next; }
      catch { break; }
    }
    return false;
  }
  if (Array.isArray(value)) return value.some(containsPrivateQuotation);
  if (value && typeof value === 'object') {
    return Object.entries(value).some(([key, item]) =>
      /^(name|company_name|email|email_address|phone|phone_number|customer_name|address|message|token|public_access_token|document_url)$/i.test(key)
      || containsPrivateQuotation(item));
  }
  return false;
}

export function publicPageUrl(value: string): string {
  const url = new URL(value, 'https://twinpeaksinvestment.com');
  return `${url.origin}${url.pathname}`;
}

export const TRACKING_ENABLED = new InjectionToken<boolean>('TRACKING_ENABLED', {
  providedIn: 'root', factory: () => environment.analyticsEnabled,
});

@Injectable({ providedIn: 'root' })
export class TrackingPrivacyService {
  readonly privateDocument: boolean;
  private readonly browser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object, private router: Router,
    @Inject(DOCUMENT) private document: Document, @Inject(TRACKING_ENABLED) private trackingEnabled: boolean) {
    this.browser = isPlatformBrowser(platformId);
    this.privateDocument = this.browser && containsPrivateQuotation(this.document.defaultView?.location.href);
  }

  canTrack(payload?: unknown): boolean {
    return this.browser && this.trackingEnabled && !this.privateDocument
      && !containsPrivateQuotation(this.document.defaultView?.location.href)
      && !containsPrivateQuotation(this.router.url)
      && !containsPrivateQuotation(payload);
  }

  /** A loaded vendor script cannot be safely unloaded. Cross the boundary with a new document. */
  allowNavigation(url: string): boolean {
    if (this.browser && this.privateDocument !== containsPrivateQuotation(url)) {
      this.document.defaultView?.location.assign(url);
      return false;
    }
    return true;
  }
}
