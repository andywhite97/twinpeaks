import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CompanyApi, ContactApi, HomepageApi, ProjectsApi, SolutionsApi } from './content-api';
import { QuotationApi } from './quotation-api';
import { environment } from '../../../environments/environment';

describe('Verified Django API contracts', () => {
  let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  const url = (path: string) => `${environment.apiUrl}/${path}`;
  it('uses the local development endpoint in tests', () => expect(environment.apiUrl).toBe('http://127.0.0.1:8000/api'));
  it('loads company information from the verified singleton endpoint', () => {
    TestBed.inject(CompanyApi).getCompany().subscribe(value => expect(value).toBeNull());
    http.expectOne(url('company/')).flush(null);
  });
  it('normalizes missing solution lists', () => {
    TestBed.inject(SolutionsApi).getSolutions().subscribe(value => expect(value).toEqual([]));
    http.expectOne(url('solutions/')).flush(null);
  });
  it('requests only featured projects', () => {
    TestBed.inject(ProjectsApi).getFeaturedProjects().subscribe(value => expect(value).toEqual([]));
    http.expectOne(url('projects/?featured=true')).flush([]);
  });
  it('loads the complete published portfolio without the featured filter', () => {
    TestBed.inject(ProjectsApi).getProjects().subscribe(value => expect(value).toEqual([])); http.expectOne(url('projects/')).flush([]);
  });
  it('encodes project identifiers', () => {
    TestBed.inject(ProjectsApi).getProject('demo/one').subscribe();
    http.expectOne(url('projects/demo%2Fone/')).flush({});
  });
  it('handles an empty homepage aggregate', () => {
    TestBed.inject(HomepageApi).getHomepage().subscribe(value => expect(value).toEqual({ hero: {}, settings: {}, solutions: [], projects: [] }));
    http.expectOne(url('homepage/')).flush(null);
  });
  it('posts the existing contact contract', () => {
    const body = { name: 'Test', email: 'test@example.invalid', message: 'Synthetic enquiry' };
    TestBed.inject(ContactApi).sendEnquiry(body).subscribe();
    const request = http.expectOne(url('contact/')); expect(request.request.method).toBe('POST'); expect(request.request.body).toEqual(body); request.flush({ ...body, id: 1, created_at: '' });
  });
  it('does not forward browser referrers and bypasses private document caches', () => {
    TestBed.inject(QuotationApi).getQuotation('private/token').subscribe();
    const request = http.expectOne(url('quotations/public/private%2Ftoken/'));
    expect(request.request.referrer).toBe(''); expect(request.request.cache).toBe('no-store'); request.flush({});
  });
  it('preserves acceptance, decline and PDF endpoints', () => {
    const api = TestBed.inject(QuotationApi);
    api.decide('token', 'accept').subscribe(); const accept = http.expectOne(url('quotations/public/token/accept/')); expect(accept.request.body).toEqual({}); accept.flush({});
    api.decide('token', 'decline', 'Synthetic reason').subscribe(); const decline = http.expectOne(url('quotations/public/token/decline/')); expect(decline.request.body).toEqual({ reason: 'Synthetic reason' }); decline.flush({});
    expect(api.pdfUrl('token')).toBe(url('quotations/public/token/pdf/'));
  });
  it('cancels superseded HTTP subscriptions', () => {
    const subscription = TestBed.inject(ProjectsApi).getFeaturedProjects().subscribe();
    const request = http.expectOne(url('projects/?featured=true')); subscription.unsubscribe(); expect(request.cancelled).toBeTrue();
  });
  it('propagates failures to the caller', () => {
    let failed = false; TestBed.inject(ProjectsApi).getFeaturedProjects().subscribe({ error: () => failed = true });
    http.expectOne(url('projects/?featured=true')).flush({}, { status: 503, statusText: 'Unavailable' }); expect(failed).toBeTrue();
  });
});
