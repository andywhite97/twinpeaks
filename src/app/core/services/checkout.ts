import { Injectable } from '@angular/core';
import { ApiService } from './api';

export interface CheckoutRequest { customer_name: string; email: string; phone_number: string; notes?: string; meta_event_id: string; event_source_url: string; items: { product_id: number; quantity: number }[]; }
export interface CheckoutPayment { order_id: string; payment_reference: string; order_status: string; payment_status: string; amount: string; currency: string; meta_event_id: string; }

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  constructor(private api: ApiService) {}
  startMomoPayment(request: CheckoutRequest) { return this.api.post<CheckoutPayment>('checkout/momo/', request); }
  paymentStatus(reference: string) { return this.api.get<CheckoutPayment>(`checkout/momo/${reference}/`); }
}
