import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { PublicQuotation } from './public-quotation';
import { QuotationApi } from '../../core/api/quotation-api';
import { PublicQuotationDto } from '../../core/api/contracts';

describe('Private quotation route compatibility', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let responses: Subject<PublicQuotationDto>[];
  let decision: Subject<PublicQuotationDto>;
  let api: jasmine.SpyObj<QuotationApi>;
  const quote = (status: PublicQuotationDto['status']) => ({ quote_number: 'QA-ONLY', name: 'Synthetic', company_name: '', status, items: [] } as unknown as PublicQuotationDto);
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ token: 'existing-token' })); responses = []; decision = new Subject();
    api = jasmine.createSpyObj('QuotationApi', ['getQuotation', 'decide', 'pdfUrl']);
    api.getQuotation.and.callFake(() => { const response = new Subject<PublicQuotationDto>(); responses.push(response); return response; });
    api.decide.and.returnValue(decision); api.pdfUrl.and.callFake(token => `/api/quotations/public/${token}/pdf/`);
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { paramMap: params } }, { provide: QuotationApi, useValue: api }] });
  });
  it('keeps existing tokens and only enables issued quotation decisions', () => {
    const fixture = TestBed.createComponent(PublicQuotation); responses[0]!.next(quote('requested'));
    expect(api.getQuotation).toHaveBeenCalledWith('existing-token'); expect(fixture.componentInstance.canRespond()).toBeFalse(); expect(fixture.componentInstance.canDownload()).toBeFalse();
    responses[0]!.next(quote('sent')); expect(fixture.componentInstance.canRespond()).toBeTrue(); expect(fixture.componentInstance.canDownload()).toBeTrue();
  });
  it('cancels previous document and decision requests when the token changes', () => {
    const fixture = TestBed.createComponent(PublicQuotation); responses[0]!.next(quote('sent')); fixture.componentInstance.decide('accept'); expect(decision.observed).toBeTrue();
    params.next(convertToParamMap({ token: 'second-token' })); expect(responses[0]!.observed).toBeFalse(); expect(decision.observed).toBeFalse(); expect(fixture.componentInstance.quotation()).toBeNull();
  });
  it('prevents duplicate decision submissions and permits recovery after a failure', () => {
    const fixture = TestBed.createComponent(PublicQuotation); responses[0]!.next(quote('sent'));
    fixture.componentInstance.decide('accept'); fixture.componentInstance.decide('accept'); expect(api.decide).toHaveBeenCalledTimes(1);
    decision.error(new Error('Synthetic timeout')); expect(fixture.componentInstance.processing()).toBeFalse(); expect(fixture.componentInstance.canRespond()).toBeFalse(); expect(fixture.componentInstance.needsReload()).toBeTrue(); expect(fixture.componentInstance.decisionMessage().toLowerCase()).toContain('reload');
    fixture.componentInstance.retry(); responses[1]!.next(quote('sent')); expect(fixture.componentInstance.canRespond()).toBeTrue();
  });
  it('supports decline reasons and updates the displayed backend state', () => {
    const fixture = TestBed.createComponent(PublicQuotation); responses[0]!.next(quote('sent')); fixture.componentInstance.decisionForm.controls.reason.setValue('Synthetic reason');
    fixture.componentInstance.decide('decline'); expect(api.decide).toHaveBeenCalledWith('existing-token', 'decline', 'Synthetic reason'); decision.next(quote('declined')); expect(fixture.componentInstance.canRespond()).toBeFalse();
  });
  it('offers retry for unavailable private documents', () => {
    const fixture = TestBed.createComponent(PublicQuotation); responses[0]!.error(new Error('Unavailable')); expect(fixture.componentInstance.error()).toBeTrue(); fixture.componentInstance.retry(); expect(fixture.componentInstance.error()).toBeFalse(); expect(api.getQuotation).toHaveBeenCalledTimes(2);
  });
  it('does not claim acceptance for an unexpected server response', () => {
    const fixture = TestBed.createComponent(PublicQuotation); responses[0]!.next(quote('sent')); fixture.componentInstance.decide('accept'); decision.next(quote('sent')); expect(fixture.componentInstance.needsReload()).toBeTrue(); expect(fixture.componentInstance.canRespond()).toBeFalse(); expect(fixture.componentInstance.quotation()?.status).toBe('sent');
  });
});
