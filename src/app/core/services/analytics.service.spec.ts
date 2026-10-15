import { AnalyticsService } from './analytics.service';
import { containsPrivateQuotation, TrackingPrivacyService } from './tracking-privacy.service';

describe('GA quotation privacy', () => {
  let service: AnalyticsService;
  let privateDocument: boolean;
  let gtag: jasmine.Spy;

  beforeEach(() => {
    privateDocument = false;
    gtag = jasmine.createSpy('gtag');
    window.gtag = gtag;
    spyOn(document.head, 'appendChild').and.callFake(node => node);
    const privacy = { canTrack: (payload: unknown) => !privateDocument && !containsPrivateQuotation(payload) } as TrackingPrivacyService;
    service = new AnalyticsService(privacy);
  });
  afterEach(() => {
    delete window.gtag; delete window.dataLayer;
    document.querySelectorAll('script[data-twinpeaks-analytics]').forEach(script => script.remove());
  });

  it('does not initialize GA or emit events from private documents', () => {
    privateDocument = true;
    service.trackPageView('/quotations/existing-token', 'Private customer quotation');
    service.trackEvent('download', { url: '/api/quotations/public/existing-token/pdf/' });
    service.trackConversion('conversion', 'label');
    expect(gtag).not.toHaveBeenCalled();
    expect(document.querySelector('script[data-twinpeaks-analytics]')).toBeNull();
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });

  it('rejects private links and personal data nested in event payloads', () => {
    service.trackEvent('download', { details: { href: '/api/quotations/public/token/pdf/' } });
    service.trackEvent('form_submit', { email: 'customer@example.com' });
    expect(gtag).not.toHaveBeenCalled();
  });

  it('retains public pageviews without query/hash/referrer leakage or automatic initial pageview', () => {
    service.trackPageView('/services?email=customer@example.com#token', 'Services');
    expect(gtag).toHaveBeenCalledWith('config', jasmine.any(String), jasmine.objectContaining({ send_page_view: false, page_referrer: '' }));
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', jasmine.objectContaining({ page_path: '/services', page_referrer: '' }));
    expect(JSON.stringify(gtag.calls.allArgs())).not.toContain('customer@example.com');
  });
});
