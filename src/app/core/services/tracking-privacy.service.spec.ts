import { Router } from '@angular/router';
import { containsPrivateQuotation, publicPageUrl, TrackingPrivacyService } from './tracking-privacy.service';

describe('Quotation document privacy', () => {
  function setup(href: string, enabled = true) {
    const assign = jasmine.createSpy('assign');
    const location = { href, assign };
    const router = { url: '/' };
    const document = { defaultView: { location } } as unknown as Document;
    return { service: new TrackingPrivacyService('browser' as unknown as object, router as Router, document, enabled), router, location, assign };
  }

  it('never permits telemetry in a document opened on a private quotation', () => {
    const { service, location, router } = setup('https://twinpeaksinvestment.com/quotations/existing-token');
    expect(service.canTrack()).toBeFalse();
    location.href = 'https://twinpeaksinvestment.com/services';
    router.url = '/services';
    expect(service.canTrack()).toBeFalse();
  });

  it('requires new documents when entering and leaving private quotations', () => {
    const publicDoc = setup('https://twinpeaksinvestment.com/services');
    expect(publicDoc.service.allowNavigation('/quotations/existing-token')).toBeFalse();
    expect(publicDoc.assign).toHaveBeenCalledOnceWith('/quotations/existing-token');
    const privateDoc = setup('https://twinpeaksinvestment.com/quotations/existing-token');
    expect(privateDoc.service.allowNavigation('/quotations/another-token')).toBeTrue();
    expect(privateDoc.service.allowNavigation('/services')).toBeFalse();
    expect(privateDoc.assign).toHaveBeenCalledOnceWith('/services');
  });

  it('blocks nested/encoded private URLs and personal fields on a public page', () => {
    const { service, router } = setup('https://twinpeaksinvestment.com/cart');
    expect(service.canTrack({ content_ids: ['camera'] })).toBeTrue();
    expect(service.canTrack({ nested: [{ url: encodeURIComponent('https://example.com/api/quotations/public/secret/pdf/') }] })).toBeFalse();
    expect(service.canTrack({ email: 'customer@example.com' })).toBeFalse();
    router.url = '/quotations/existing-token';
    expect(service.canTrack()).toBeFalse();
    expect(containsPrivateQuotation('/contact?next=%252Fquotations%252Fsecret')).toBeTrue();
    expect(publicPageUrl('/cart?email=customer@example.com#secret')).toBe('https://twinpeaksinvestment.com/cart');
  });

  it('disables development telemetry', () => {
    expect(setup('http://localhost:4200/cart', false).service.canTrack()).toBeFalse();
  });
});
