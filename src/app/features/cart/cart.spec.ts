import { signal } from '@angular/core';

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
  it('tracks InitiateCheckout when the customer enters checkout with cart items', () => {
    const items: CartItem[] = [{ product, quantity: 2 }];
    const cart = { items: signal(items) } as CartService;
    const meta = jasmine.createSpyObj<MetaTrackingService>('MetaTrackingService', ['trackInitiateCheckout']);
    const component = new Cart(cart, jasmine.createSpyObj<CheckoutService>('CheckoutService', ['startMomoPayment', 'paymentStatus']), meta, jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'info']));

    component.ngOnInit();

    expect(meta.trackInitiateCheckout).toHaveBeenCalledOnceWith(items);
  });
});
