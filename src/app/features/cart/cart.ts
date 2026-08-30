import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

import { CartService } from '../../core/services/cart';
import { CheckoutPayment, CheckoutService } from '../../core/services/checkout';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { MetaTrackingService } from '../../core/services/meta-tracking.service';

@Component({
  selector: 'app-cart', standalone: true, imports: [DecimalPipe, ReactiveFormsModule, RouterLink, PageHeader],
  templateUrl: './cart.html', styleUrl: './cart.css', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart implements OnInit, OnDestroy {
  readonly isSubmitting = signal(false);
  readonly error = signal('');
  readonly payment = signal<CheckoutPayment | null>(null);
  private statusSubscription?: Subscription;
  checkoutForm = new FormGroup({
    customer_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone_number: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{8,15}$/)] }),
    notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000)] }),
  });

  constructor(public readonly cart: CartService, private checkout: CheckoutService, private metaTracking: MetaTrackingService) {}
  ngOnInit() { if (this.cart.items().length) this.metaTracking.trackInitiateCheckout(this.cart.items()); }
  ngOnDestroy() { this.statusSubscription?.unsubscribe(); }

  checkoutWithMomo(): void {
    if (this.checkoutForm.invalid || !this.cart.items().length) { this.checkoutForm.markAllAsTouched(); return; }
    this.error.set(''); this.isSubmitting.set(true);
    const metaEventId = this.metaTracking.eventId();
    this.checkout.startMomoPayment({ ...this.checkoutForm.getRawValue(), meta_event_id: metaEventId, event_source_url: window.location.href, items: this.cart.items().map((item) => ({ product_id: item.product.id, quantity: item.quantity })) }).subscribe({
      next: (payment) => { this.payment.set(payment); this.isSubmitting.set(false); this.pollPayment(payment.payment_reference); },
      error: (response) => { this.error.set(response?.error?.detail ?? 'Unable to start the MTN MoMo payment. Please try again.'); this.isSubmitting.set(false); },
    });
  }

  setQuantity(productId: number, value: string) { this.cart.setQuantity(productId, Number(value)); }
  remove(product: Parameters<CartService['remove']>[0]) { this.cart.remove(product); }

  private pollPayment(reference: string) {
    this.statusSubscription?.unsubscribe();
    this.statusSubscription = timer(3000, 5000).pipe(
      switchMap(() => this.checkout.paymentStatus(reference)),
      takeWhile((payment) => payment.payment_status === 'pending', true),
    ).subscribe({
      next: (payment) => { this.payment.set(payment); if (payment.order_status === 'paid') { this.metaTracking.trackPurchase(payment, this.cart.items()); this.cart.clear(); } },
      error: () => this.error.set('We could not refresh your payment status. You may retry in a moment.'),
    });
  }
}
