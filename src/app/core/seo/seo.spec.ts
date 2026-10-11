import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { SeoService } from './seo.service';
describe('Private quotation metadata', () => {
  it('adds route-specific breadcrumbs and removes them on private navigation', () => {
    const seo = TestBed.inject(SeoService); const document = TestBed.inject(DOCUMENT);
    seo.update('/projects/verified', 'Verified', 'Description', false, [{ name: 'Home', path: '/' }, { name: 'Verified </script>', path: '/projects/verified' }]);
    const script = document.getElementById('page-breadcrumb-schema')!; expect(JSON.parse(script.textContent!).itemListElement.length).toBe(2); expect(script.textContent).not.toContain('</script>');
    seo.update('/quotations/token', 'Private', 'Private', true); expect(document.getElementById('page-breadcrumb-schema')).toBeNull();
  });
  it('never includes access tokens in canonical or Open Graph metadata', () => {
    TestBed.inject(SeoService).update('/quotations/synthetic-secret?customer=private', 'Your Private Quotation', 'Private quotation', true);
    const document = TestBed.inject(DOCUMENT);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('http://127.0.0.1:4201/quotations');
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).not.toContain('synthetic-secret');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
  });
});
