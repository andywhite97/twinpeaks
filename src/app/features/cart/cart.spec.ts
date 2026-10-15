import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { CartService, CartItem } from '../../core/services/cart';
import { CheckoutService } from '../../core/services/checkout';
import { MetaTrackingService } from '../../core/services/meta-tracking.service';
import { NotificationService } from '../../core/services/notification.service';
import { Product } from '../../shared/models/product.model';
import { Cart } from './cart';

const product: Product = {
  id: 7, name: 'TwinPeaks Pro Package', slug: 'twinpeaks-pro-package', description: '',
  price: 1200, sale_price: 999, stock_quantity: 10, stock_status: 'in_stock',
  rating: 0, installation_available: false, is_featured: false,
};

describe('Cart Meta tracking', () => {
  beforeEach(() => { for (const key of ['twinpeaks-payment-attempt', 'twinpeaks-payment-reference', 'twinpeaks-payment-items']) sessionStorage.removeItem(key); });
  afterEach(() => { for (const key of ['twinpeaks-payment-attempt', 'twinpeaks-payment-reference', 'twinpeaks-payment-items']) sessionStorage.removeItem(key); });
  it('tracks InitiateCheckout when the customer enters checkout with cart items', () => {
    const items: CartItem[] = [{ product, quantity: 2 }];
    const cart = { items: signal(items) } as CartService;
    const meta = jasmine.createSpyObj<MetaTrackingService>('MetaTrackingService', ['trackInitiateCheckout']);
    const component = new Cart(cart, jasmine.createSpyObj<CheckoutService>('CheckoutService', ['startMomoPayment', 'paymentStatus']), meta, jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'info']));

    component.ngOnInit();

    expect(meta.trackInitiateCheckout).toHaveBeenCalledOnceWith(items);
  });

  it('reuses the same attempt ID after an uncertain submission', () => {
    const cart = { items: signal([{ product, quantity: 1 }]) } as CartService;
    const checkout = jasmine.createSpyObj<CheckoutService>('checkout', ['startMomoPayment', 'paymentStatus']);
    checkout.startMomoPayment.and.returnValue(throwError(() => ({ status: 0 })));
    const meta = jasmine.createSpyObj<MetaTrackingService>('meta', ['eventId', 'trackInitiateCheckout', 'trackPurchase']);
    meta.eventId.and.returnValue('11111111-1111-4111-8111-111111111111');
    const component = new Cart(cart, checkout, meta, jasmine.createSpyObj<NotificationService>('notifications', ['success', 'error', 'info']));
    component.checkoutForm.patchValue({ customer_name: 'Buyer', email: 'buyer@example.com', phone_number: '26876123456' });
    component.checkoutWithMomo();
    component.checkoutWithMomo();
    expect(meta.eventId).toHaveBeenCalledTimes(1);
    expect(checkout.startMomoPayment.calls.argsFor(0)[0].meta_event_id).toBe(checkout.startMomoPayment.calls.argsFor(1)[0].meta_event_id);
    expect(checkout.startMomoPayment.calls.argsFor(0)[0].event_source_url).toBeUndefined();
  });

  it('recovers the existing reference after refresh and does not clear a different basket', () => {
    jasmine.clock().install();
    try {
    sessionStorage.setItem('twinpeaks-payment-reference', 'reference');
    sessionStorage.setItem('twinpeaks-payment-items', JSON.stringify([[product.id, 1]]));
    const cart = { items: signal([{ product, quantity: 2 }]), clear: jasmine.createSpy('clear') } as unknown as CartService;
    const checkout = jasmine.createSpyObj<CheckoutService>('checkout', ['startMomoPayment', 'paymentStatus']);
    checkout.paymentStatus.and.returnValue(of({ order_id: 'order', payment_reference: 'reference', order_status: 'paid', payment_status: 'successful', amount: '999', currency: 'SZL', meta_event_id: 'event' }));
    const meta = jasmine.createSpyObj<MetaTrackingService>('meta', ['trackInitiateCheckout', 'trackPurchase']);
    const component = new Cart(cart, checkout, meta, jasmine.createSpyObj<NotificationService>('notifications', ['success', 'error', 'info']));
    component.ngOnInit();
    jasmine.clock().tick(3000);
    expect(checkout.paymentStatus).toHaveBeenCalledOnceWith('reference');
    expect(cart.clear).not.toHaveBeenCalled();
    expect(meta.trackPurchase).not.toHaveBeenCalled();
    component.finishPayment();
    expect(sessionStorage.getItem('twinpeaks-payment-reference')).toBeNull();
    component.ngOnDestroy();
    } finally { jasmine.clock().uninstall(); }
  });
});
