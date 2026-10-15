import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CartItem } from './cart';
import { MetaTrackingService } from './meta-tracking.service';
import { Product } from '../../shared/models/product.model';
import { containsPrivateQuotation, TrackingPrivacyService } from './tracking-privacy.service';

const product: Product = {
  id: 7, name: 'TwinPeaks Pro Package', slug: 'twinpeaks-pro-package', description: '',
  price: 1200, sale_price: 999, stock_quantity: 10, stock_status: 'in_stock',
  rating: 0, installation_available: false, is_featured: false,
};

describe('MetaTrackingService', () => {
  let service: MetaTrackingService;
  let fbq: jasmine.Spy;
  let privateDocument: boolean;

  beforeEach(() => {
    fbq = jasmine.createSpy('fbq');
    privateDocument = false;
    window.fbq = fbq;
    spyOn(document.head, 'appendChild').and.callFake(node => node);
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' },
      { provide: TrackingPrivacyService, useValue: { canTrack: (data: unknown) => !privateDocument && !containsPrivateQuotation(data) } }] });
    service = TestBed.inject(MetaTrackingService);
  });

  afterEach(() => { delete window.fbq; delete window._fbq; document.querySelectorAll('script[data-twinpeaks-meta-pixel]').forEach(script => script.remove()); });

  it('does not initialize or track any events on quotation documents', () => {
    privateDocument = true;
    service.initialize();
    service.trackPageView('https://twinpeaksinvestment.com/quotations/existing-token');
    service.trackViewContent(product);
    service.trackAddToCart(product, 1);
    expect(fbq).not.toHaveBeenCalled();
    expect(document.querySelector('script[data-twinpeaks-meta-pixel]')).toBeNull();
  });

  it('rejects encoded private URLs even on a public page', () => {
    service.trackPageView('https://twinpeaksinvestment.com/contact?next=%2Fquotations%2Fsecret');
    expect(fbq).not.toHaveBeenCalled();
  });

  it('sends ViewContent through the standard fbq track API with the catalog slug', () => {
    service.trackViewContent(product);

    expect(fbq).toHaveBeenCalledWith('track', 'ViewContent', jasmine.objectContaining({
      content_ids: [product.slug], content_type: 'product', content_name: product.name,
      value: 999, currency: 'SZL', contents: [{ id: product.slug, quantity: 1, item_price: 999 }],
    }), jasmine.any(Object));
  });

  it('sends AddToCart through the standard fbq track API with the successful quantity', () => {
    service.trackAddToCart(product, 2);

    expect(fbq).toHaveBeenCalledWith('track', 'AddToCart', jasmine.objectContaining({
      content_ids: [product.slug], contents: [{ id: product.slug, quantity: 2, item_price: 999 }],
      value: 999, currency: 'SZL',
    }), jasmine.any(Object));
  });

  it('sends InitiateCheckout through the standard fbq track API using current cart items', () => {
    const items: CartItem[] = [{ product, quantity: 2 }];
    service.trackInitiateCheckout(items);

    expect(fbq).toHaveBeenCalledWith('track', 'InitiateCheckout', jasmine.objectContaining({
      content_ids: [product.slug], contents: [{ id: product.slug, quantity: 2, item_price: 999 }],
      num_items: 2, value: 1998, currency: 'SZL',
    }), jasmine.any(Object));
  });

  it('keeps PageView de-duplicated per URL', () => {
    service.trackPageView('https://twinpeaksinvestment.com/products/twinpeaks-pro-package');
    service.trackPageView('https://twinpeaksinvestment.com/products/twinpeaks-pro-package');

    expect(fbq.calls.allArgs().filter(([command, event]) => command === 'track' && event === 'PageView').length).toBe(1);
  });

  it('queues a standard event when fbevents.js is still loading', () => {
    delete window.fbq;
    service.trackViewContent(product);
    const queuedFbq = window.fbq as { queue?: unknown[][] } | undefined;

    expect(queuedFbq?.queue ?? []).toContain(jasmine.arrayContaining(['track', 'ViewContent']));
    expect(queuedFbq?.queue ?? []).toContain(jasmine.arrayContaining(['init', '4551355081771302']));
  });
});
