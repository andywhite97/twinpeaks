import { inject, Injectable } from '@angular/core';
import { ApiClient } from './api-client';
import { PublicQuotationDto, QuotationRequest, QuotationRequestResponse } from './contracts';

@Injectable({ providedIn: 'root' })
export class QuotationApi {
  private api = inject(ApiClient);
  getQuotation(token: string) { return this.api.get<PublicQuotationDto>(`quotations/public/${encodeURIComponent(token)}/`, true); }
  decide(token: string, decision: 'accept' | 'decline', reason = '') {
    return this.api.post<PublicQuotationDto>(`quotations/public/${encodeURIComponent(token)}/${decision}/`, decision === 'decline' ? { reason } : {});
  }
  pdfUrl(token: string) { return this.api.url(`quotations/public/${encodeURIComponent(token)}/pdf/`); }
  requestQuotation(request: QuotationRequest) { return this.api.post<QuotationRequestResponse>('quotations/', request); }
}
