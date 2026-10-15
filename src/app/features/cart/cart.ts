import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { exhaustMap, take, takeWhile, timeout } from 'rxjs/operators';

import { CartService } from '../../core/services/cart';
import { CheckoutPayment, CheckoutService } from '../../core/services/checkout';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { MetaTrackingService } from '../../core/services/meta-tracking.service';
import { NotificationService } from '../../core/services/notification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart', standalone: true, imports: [DecimalPipe, ReactiveFormsModule, RouterLink, PageHeader],
  templateUrl: './cart.html', styleUrl: './cart.css', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart implements OnInit, OnDestroy {
  readonly isSubmitting = signal(false);
  readonly error = signal('');
  readonly payment = signal<CheckoutPayment | null>(null);
  private statusSubscription?: Subscription;
  private attemptId?: string;
  private restoredReference?: string;
  private submittedItems?: string;
  checkoutForm = new FormGroup({
    customer_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone_number: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{8,15}$/)] }),
    notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000)] }),
  });

  constructor(public readonly cart: CartService, private checkout: CheckoutService, private metaTracking: MetaTrackingService, private notifications: NotificationService) {}
  ngOnInit() {
    if (typeof sessionStorage !== 'undefined') {
      try {
        this.attemptId = sessionStorage.getItem('twinpeaks-payment-attempt') ?? undefined;
        this.submittedItems = sessionStorage.getItem('twinpeaks-payment-items') ?? undefined;
        this.restoredReference = sessionStorage.getItem('twinpeaks-payment-reference') ?? undefined;
        if (this.restoredReference) { this.isSubmitting.set(true); this.pollPayment(this.restoredReference); }
      } catch { /* Storage may be restricted; keep the attempt in memory. */ }
    }
    if (this.cart.items().length) this.metaTracking.trackInitiateCheckout(this.cart.items());
  }
  ngOnDestroy() { this.statusSubscription?.unsubscribe(); }

  checkoutWithMomo(): void {
    if (this.isSubmitting() || this.payment()) return;
    if (this.checkoutForm.invalid || !this.cart.items().length) { this.checkoutForm.markAllAsTouched(); return; }
    this.error.set(''); this.isSubmitting.set(true);
    this.attemptId ??= this.metaTracking.eventId();
    this.submittedItems ??= this.basketSignature();
    this.storeAttempt('twinpeaks-payment-attempt', this.attemptId);
    this.storeAttempt('twinpeaks-payment-items', this.submittedItems);
    this.checkout.startMomoPayment({ ...this.checkoutForm.getRawValue(), meta_event_id: this.attemptId, event_source_url: environment.production ? `${window.location.origin}/cart` : undefined, items: this.cart.items().map((item) => ({ product_id: item.product.id, quantity: item.quantity })) }).subscribe({
      next: (payment) => { this.storeAttempt('twinpeaks-payment-reference', payment.payment_reference); this.isSubmitting.set(false); this.handlePayment(payment); if (payment.payment_status === 'pending') this.pollPayment(payment.payment_reference); },
      error: (response) => { const message = response?.error?.detail ?? 'Submission is unconfirmed. Retry with the same details to recover this payment attempt; do not start another payment.'; this.error.set(message); this.notifications.error(message); this.isSubmitting.set(false); },
    });
  }

  setQuantity(productId: number, value: string) { this.cart.setQuantity(productId, Number(value)); }
  remove(product: Parameters<CartService['remove']>[0]) { this.cart.remove(product); this.notifications.info(`${product.name} removed from your cart.`); }

  private pollPayment(reference: string) {
    this.statusSubscription?.unsubscribe();
    this.statusSubscription = timer(3000, 5000).pipe(
      exhaustMap(() => this.checkout.paymentStatus(reference).pipe(timeout(45000))),
      take(60),
      takeWhile((payment) => payment.payment_status === 'pending', true),
    ).subscribe({
      next: (payment) => { this.isSubmitting.set(false); this.handlePayment(payment); },
      error: () => { this.isSubmitting.set(false); const message = 'We could not refresh your payment status. Check this same reference again; do not start another payment.'; this.error.set(message); this.notifications.error(message); },
      complete: () => { if (this.payment()?.payment_status === 'pending') this.error.set('Automatic checks have paused. Check this same payment reference again or contact our team.'); },
    });
  }

  refreshPayment(): void { const reference = this.payment()?.payment_reference ?? this.restoredReference; if (reference) { this.error.set(''); this.pollPayment(reference); } }

  get canRecoverReference(): boolean { return Boolean(this.restoredReference); }

  finishPayment(): void {
    if (this.payment()?.order_status !== 'paid' && this.payment()?.payment_status !== 'failed') return;
    this.statusSubscription?.unsubscribe();
    this.attemptId = undefined; this.restoredReference = undefined; this.submittedItems = undefined;
    this.payment.set(null); this.error.set('');
    try { for (const key of ['twinpeaks-payment-attempt', 'twinpeaks-payment-reference', 'twinpeaks-payment-items']) sessionStorage.removeItem(key); } catch { /* Restricted storage. */ }
  }

  private handlePayment(payment: CheckoutPayment): void {
    const previouslyPaid = this.payment()?.order_status === 'paid';
    this.payment.set(payment);
    if (payment.order_status === 'paid' && !previouslyPaid) {
      if (this.submittedItems === this.basketSignature()) {
        this.metaTracking.trackPurchase(payment, this.cart.items()); this.cart.clear();
      }
      this.notifications.success('Payment received. Your order is confirmed.');
    }
  }

  private basketSignature(): string { return JSON.stringify(this.cart.items().map(item => [item.product.id, item.quantity]).sort((a, b) => a[0] - b[0])); }

  private storeAttempt(key: string, value: string): void {
    try { sessionStorage.setItem(key, value); } catch { /* Keep in-memory recovery. */ }
  }
}
