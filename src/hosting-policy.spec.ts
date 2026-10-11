import { allowedHost, compressionEncoding, securityHeaders, staticCache } from './hosting-policy';
describe('SSR hosting policy', () => {
  it('honors encoding qualities, rejects q=0 and preserves uncompressed clients', () => {
    expect(compressionEncoding('gzip, br')).toBe('br'); expect(compressionEncoding('br;q=0, gzip;q=0.8')).toBe('gzip'); expect(compressionEncoding('br;q=0.2, gzip;q=0.9')).toBe('gzip'); expect(compressionEncoding('br;q=invalid')).toBeUndefined(); expect(compressionEncoding(undefined)).toBeUndefined(); expect(compressionEncoding('identity')).toBeUndefined();
  });
  it('accepts only the configured site or explicit loopback hosts', () => {
    expect(allowedHost('twinpeaksinvestment.com', 'https://twinpeaksinvestment.com')).toBeTrue();
    expect(allowedHost('127.0.0.1:18182', 'https://twinpeaksinvestment.com')).toBeTrue();
    for (const host of [undefined, 'evil.example', 'twinpeaksinvestment.com.evil.example', 'user@twinpeaksinvestment.com', 'twinpeaksinvestment.com/evil', 'localhost?evil']) expect(allowedHost(host, 'https://twinpeaksinvestment.com')).toBeFalse();
  });
  it('marks only fingerprinted script/style files immutable', () => {
    expect(staticCache('/main-ABCDEFGH.js')).toContain('immutable');
    expect(staticCache('/styles-ABCDEFGH.css')).toContain('immutable');
    for (const asset of ['/assets/brand/icon_only.png', '/assets/fonts/Poppins-Regular.ttf', '/main.js', '/robots.txt']) expect(staticCache(asset)).not.toContain('immutable');
  });
  it('provides basic embedding/referrer protections without inventing a strict script policy', () => {
    expect(securityHeaders['Referrer-Policy']).toBe('no-referrer'); expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff'); expect(securityHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'"); expect(securityHeaders['Content-Security-Policy']).not.toContain('unsafe-inline');
  });
});
