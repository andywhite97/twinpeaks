import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { HttpErrorResponse, HttpHeaders, provideHttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, of, TimeoutError } from 'rxjs';
import { Contact } from './contact';
import { RequestQuote } from './request-quote';
import { ContactApi, ProjectsApi } from '../../core/api/content-api';
import { QuotationApi } from '../../core/api/quotation-api';
import { ContactResponse, QuotationRequestResponse, ProjectDto } from '../../core/api/contracts';
import { approvedCopy, enquiryContext, phoneDigits, validPhone, whatsappHref } from '../../shared/forms/lead-helpers';
import { FormControl } from '@angular/forms';

describe('Corporate lead forms with synthetic APIs', () => {
  let contact: jasmine.SpyObj<ContactApi>; let quotes: jasmine.SpyObj<QuotationApi>; let projects: jasmine.SpyObj<ProjectsApi>;
  let contactResponse: Subject<ContactResponse>; let quoteResponse: Subject<QuotationRequestResponse>;
  beforeEach(() => {
    contactResponse = new Subject(); quoteResponse = new Subject();
    contact = jasmine.createSpyObj('ContactApi', ['sendEnquiry']); contact.sendEnquiry.and.returnValue(contactResponse);
    quotes = jasmine.createSpyObj('QuotationApi', ['requestQuotation']); quotes.requestQuotation.and.returnValue(quoteResponse);
    projects = jasmine.createSpyObj('ProjectsApi', ['getProject']); projects.getProject.and.returnValue(of({ slug: 'qa-project', title: 'Synthetic QA project' } as ProjectDto));
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } }, { provide: ContactApi, useValue: contact }, { provide: QuotationApi, useValue: quotes }, { provide: ProjectsApi, useValue: projects }] });
  });
  const contactValues = { name: 'Synthetic QA Customer', email: 'qa@example.invalid', phone: '+268 7600 0000', company: 'QA only', service: 'general', message: 'Synthetic interface test enquiry.', consent: true };
  function validQuote(component: RequestQuote) { component.form.patchValue({ name: 'Synthetic QA Customer', email: 'qa@example.invalid', phone: '+268 7600 0000', description: 'Synthetic quotation test description, not a real enquiry.', location: 'QA area', consent: true }); component.form.controls.categories.at(0).setValue(true); }
  it('rejects invalid/blank contact fields without a POST', () => { const c = TestBed.createComponent(Contact).componentInstance; c.submit(); expect(contact.sendEnquiry).not.toHaveBeenCalled(); expect(c.error('name')).toBeTruthy(); });
  it('posts only supported contact fields and prevents concurrent duplicates', () => {
    const c = TestBed.createComponent(Contact).componentInstance; c.form.setValue(contactValues); c.submit(); c.submit();
    expect(contact.sendEnquiry).toHaveBeenCalledTimes(1); const body = contact.sendEnquiry.calls.mostRecent().args[0]; expect(Object.keys(body).sort()).toEqual(['email', 'message', 'name']); expect(body.message).toContain('Phone: 26876000000'); expect(c.submission.state()).toBe('pending');
    contactResponse.next({ ...body, id: 9001, created_at: '2026-10-11T00:00:00Z' }); expect(c.submission.state()).toBe('success'); expect(c.form.controls.name.value).toBe(''); c.submit(); expect(contact.sendEnquiry).toHaveBeenCalledTimes(1);
  });
  it('preserves input and maps server validation without echoing server data', () => {
    const c = TestBed.createComponent(Contact).componentInstance; c.form.setValue(contactValues); c.submit(); contactResponse.error(new HttpErrorResponse({ status: 400, error: { email: ['UNTRUSTED SERVER ECHO'] } }));
    expect(c.form.controls.name.value).toBe(contactValues.name); expect(c.error('email')).toContain('server'); expect(c.submission.message()).not.toContain('UNTRUSTED');
  });
  it('ignores prototype and non-field validation keys for contact and quote forms', () => {
    const c = TestBed.createComponent(Contact).componentInstance; c.form.setValue(contactValues); c.submit(); contactResponse.error(new HttpErrorResponse({status:400,error:{constructor:['Synthetic'],non_field_errors:['Synthetic']}})); expect(c.submission.state()).toBe('error'); expect(c.form.controls.name.value).toBe(contactValues.name);
    const q = TestBed.createComponent(RequestQuote).componentInstance; validQuote(q); q.review(); q.submit(); quoteResponse.error(new HttpErrorResponse({status:400,error:{constructor:['Synthetic'],non_field_errors:['Synthetic']}})); expect(q.serverFields()).toEqual([]); expect(q.submission.state()).toBe('error');
  });
  it('requires acknowledgement before retrying an ambiguous contact result', () => {
    const c = TestBed.createComponent(Contact).componentInstance; c.form.setValue(contactValues); c.submit(); contactResponse.error(new TimeoutError()); c.submit(); expect(contact.sendEnquiry).toHaveBeenCalledTimes(1); expect(c.submission.ambiguous()).toBeTrue(); expect(c.form.controls.message.value).toBe(contactValues.message);
    contact.sendEnquiry.and.returnValue(new Subject()); c.submission.retryAcknowledged.set(true); c.submit(); expect(contact.sendEnquiry).toHaveBeenCalledTimes(2);
  });
  it('treats a malformed successful response as uncertain', () => { const c = TestBed.createComponent(Contact).componentInstance; c.form.setValue(contactValues); c.submit(); contactResponse.next({} as ContactResponse); expect(c.submission.state()).toBe('error'); expect(c.submission.blocked()).toBeTrue(); });
  it('respects throttling without automatically retrying', () => {
    const c = TestBed.createComponent(Contact).componentInstance; c.form.setValue(contactValues); c.submit(); contactResponse.error(new HttpErrorResponse({ status: 429, headers: new HttpHeaders({ 'Retry-After': '60' }) })); c.submit(); expect(c.submission.cooldown()).toBeTrue(); expect(contact.sendEnquiry).toHaveBeenCalledTimes(1);
  });
  it('cancels a pending request when the form is destroyed', () => { const fixture = TestBed.createComponent(Contact); fixture.componentInstance.form.setValue(contactValues); fixture.componentInstance.submit(); expect(contactResponse.observed).toBeTrue(); fixture.destroy(); expect(contactResponse.observed).toBeFalse(); });
  it('requires a category, meaningful description and consent for quotation review', () => { const c = TestBed.createComponent(RequestQuote).componentInstance; c.review(); expect(c.reviewing()).toBeFalse(); expect(quotes.requestQuotation).not.toHaveBeenCalled(); });
  it('requires company name for business requests', () => { const c = TestBed.createComponent(RequestQuote).componentInstance; validQuote(c); c.form.controls.customerType.setValue('business'); c.review(); expect(c.reviewing()).toBeFalse(); c.form.controls.company.setValue('QA organization'); c.review(); expect(c.reviewing()).toBeTrue(); });
  it('uses multiple supported custom items, normalizes phone and keeps extra details in message', () => {
    const c = TestBed.createComponent(RequestQuote).componentInstance; validQuote(c); c.form.controls.categories.at(4).setValue(true); c.form.patchValue({ budget: 'QA budget', timeline: 'QA timeline' }); c.review(); c.submit(); c.submit();
    expect(quotes.requestQuotation).toHaveBeenCalledTimes(1); const body = quotes.requestQuotation.calls.mostRecent().args[0]; expect(body.items.length).toBe(2); expect(body.items.every(item => 'description' in item && item.quantity === 1)).toBeTrue(); expect(body.phone_number).toBe('26876000000'); expect(body.message).toContain('QA budget'); expect(Object.keys(body).sort()).toEqual(['address', 'company_name', 'email', 'items', 'message', 'name', 'phone_number']);
    quoteResponse.next({ status: 'requested', quote_number: 'TP-Q-2026-9001', public_access_token: '11111111-1111-4111-8111-111111111111' }); expect(c.reference()).toBe('TP-Q-2026-9001'); expect(c.submission.state()).toBe('success'); expect(c.form.controls.email.value).toBe('');
  });
  it('keeps quotation data and blocks ambiguous retries, including after editing', () => {
    const c = TestBed.createComponent(RequestQuote).componentInstance; validQuote(c); c.review(); c.submit(); quoteResponse.error(new HttpErrorResponse({ status: 503 })); c.reviewing.set(false); c.review(); expect(c.reviewing()).toBeTrue(); c.submit(); expect(quotes.requestQuotation).toHaveBeenCalledTimes(1); expect(c.form.controls.name.value).toContain('Synthetic');
  });
  it('maps quotation validation to visible controls', () => { const c = TestBed.createComponent(RequestQuote).componentInstance; validQuote(c); c.review(); c.submit(); quoteResponse.error(new HttpErrorResponse({ status: 400, error: { phone_number: ['Invalid'] } })); expect(c.reviewing()).toBeFalse(); expect(c.error('phone')).toContain('server'); });
  it('ignores arbitrary query data and unsafe project paths', () => { const ctx = enquiryContext(convertToParamMap({ solution: 'bogus', project: '../private/token', enquiry: 'anything', email: 'private@example.invalid' })); expect(ctx).toEqual({ solution: undefined, project: '', assessment: false }); });
  it('preselects only known categories and verifies project context with a public GET', () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { queryParamMap: convertToParamMap({ solution: 'web-app-development', enquiry: 'site-assessment', project: 'qa-project' }) } } });
    const c = TestBed.createComponent(RequestQuote).componentInstance; expect(c.form.controls.categories.at(4).value).toBeTrue(); expect(c.context.projectTitle()).toBe('Synthetic QA project'); expect(projects.getProject).toHaveBeenCalledWith('qa-project'); expect(c.form.controls.email.value).toBe('');
  });
  it('omits placeholder copy and rejects unsafe WhatsApp/phone values', () => { expect(approvedCopy('Coming Soon')).toBe(''); expect(approvedCopy('Published mission')).toBe('Published mission'); expect(whatsappHref('javascript:alert(1)')).toBeNull(); expect(whatsappHref('26876000000')).toBe('https://wa.me/26876000000'); expect(validPhone(new FormControl('abc26876000000'))).not.toBeNull(); expect(phoneDigits('+268 7600 0000')).toBe('26876000000'); });
  it('updates client query context without overwriting edited form fields', () => {
    const initial = convertToParamMap({}); const params = new BehaviorSubject(initial);
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { queryParamMap: initial }, queryParamMap: params } });
    const c = TestBed.createComponent(Contact).componentInstance; params.next(convertToParamMap({ solution: 'web-app-development' })); expect(c.form.controls.service.value).toBe('web-app-development'); c.form.markAsDirty(); c.form.controls.name.setValue('Synthetic edit'); params.next(convertToParamMap({ solution: 'network-infrastructure' })); expect(c.form.controls.service.value).toBe('web-app-development'); expect(c.form.controls.name.value).toBe('Synthetic edit');
  });
});
