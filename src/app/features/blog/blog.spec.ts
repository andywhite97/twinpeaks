import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Blog } from './blog';
import { Article } from './article';
import { NewsletterSignup } from './newsletter-signup';
import { SubscriptionAction } from './subscription-action';
import { environment } from '../../../environments/environment';

describe('Journal and subscription flows', () => {
  let http: HttpTestingController;
  const url = (path: string) => `${environment.apiUrl}/${path}`;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }); });
  afterEach(() => http.verify());
  it('requires explicit consent and prevents duplicate submissions', () => {
    const c = TestBed.createComponent(NewsletterSignup).componentInstance;
    http = TestBed.inject(HttpTestingController);
    http.expectOne(url('solutions/')).flush([]);
    c.form.controls.email.setValue('reader@example.invalid'); c.submit();
    http.expectNone(url('newsletter/subscribe/'));
    c.form.controls.consent.setValue(true); c.submit(); c.submit();
    const request = http.expectOne(url('newsletter/subscribe/'));
    expect(request.request.body.consent).toBeTrue();
    request.flush({ message: 'Check your email.' });
    expect(c.message()).toBe('Check your email.'); expect(c.form.controls.email.value).toBe('');
  });
  it('retains signup values when a request fails', () => {
    const c = TestBed.createComponent(NewsletterSignup).componentInstance;
    http = TestBed.inject(HttpTestingController);
    http.expectOne(url('solutions/')).flush([]);
    c.form.setValue({ email: 'reader@example.invalid', consent: true }); c.submit();
    http.expectOne(url('newsletter/subscribe/')).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(c.form.controls.email.value).toBe('reader@example.invalid'); expect(c.busy()).toBeFalse();
  });
  it('cancels outdated category requests', () => {
    const fixture = TestBed.createComponent(Blog); const c = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(url('solutions/')).flush([]);
    http.expectOne(url('blog/categories/')).flush([]);
    const first = http.expectOne(url('blog/posts/?page=1&category='));
    c.filter('security'); expect(first.cancelled).toBeTrue();
    http.expectOne(url('blog/posts/?page=1&category=security')).flush({ count: 0, results: [], next: null, previous: null });
    expect(c.state()).toBe('ready'); expect(c.featured()).toBeUndefined();
  });
  it('does not confirm subscriptions just by opening an email link', () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { data: { action: 'confirm' }, fragment: 'token=sample-token' }, data: of({ action: 'confirm' }), fragment: of('token=sample-token') } });
    const c = TestBed.createComponent(SubscriptionAction).componentInstance;
    http = TestBed.inject(HttpTestingController);
    http.expectNone(url('newsletter/confirm/'));
    c.submit();
    const request = http.expectOne(url('newsletter/confirm/'));
    expect(request.request.body).toEqual({ token: 'sample-token' }); request.flush({ message: 'Confirmed' });
    expect(c.done()).toBeTrue();
  });
  it('sanitizes rendered article HTML and links to matching solutions', () => {
    const content = { state: 'ready', post: { title: 'Example', excerpt: '', body: '<p>Safe text</p><img src=x onerror="alert(1)"><script>alert(2)</script>', solutions: [{ id: 1, title: 'Network Infrastructure' }], published_at: '2026-11-12T00:00:00Z' } };
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { data: { content } }, data: of({ content }) } });
    const fixture = TestBed.createComponent(Article); fixture.detectChanges();
    http = TestBed.inject(HttpTestingController);
    http.expectOne(url('solutions/')).flush([]);
    expect(fixture.nativeElement.querySelector('.article-body script')).toBeNull();
    expect(fixture.nativeElement.querySelector('.article-body img').hasAttribute('onerror')).toBeFalse();
    expect(fixture.componentInstance.solutionPath('Network Infrastructure')).toEqual(['/solutions', 'network-infrastructure']);
  });
});
