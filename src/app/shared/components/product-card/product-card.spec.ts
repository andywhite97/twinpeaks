import { CartService } from '../../../core/services/cart';
import { MetaTrackingService } from '../../../core/services/meta-tracking.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../models/product.model';
import { ProductCard } from './product-card';

const product: Product = {
  id: 7, name: 'TwinPeaks Pro Package', slug: 'twinpeaks-pro-package', description: '',
  price: 1200, sale_price: 999, stock_quantity: 10, stock_status: 'in_stock',
  rating: 0, installation_available: false, is_featured: false,
};

describe('ProductCard Meta tracking', () => {
  it('tracks AddToCart only after the cart accepts the product', () => {
    const cart = jasmine.createSpyObj<CartService>('CartService', ['add', 'contains', 'remove']);
    cart.add.and.returnValue(true);
    cart.contains.and.returnValue(false);
    const meta = jasmine.createSpyObj<MetaTrackingService>('MetaTrackingService', ['trackAddToCart']);
    const component = new ProductCard(cart, meta, jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'info']));
    component.product = product;

    component.toggleCart(new Event('click'));

    expect(cart.add).toHaveBeenCalledWith(product);
    expect(meta.trackAddToCart).toHaveBeenCalledOnceWith(product, 1);
  });

  it('does not track AddToCart when insertion fails', () => {
    const cart = jasmine.createSpyObj<CartService>('CartService', ['add', 'contains', 'remove']);
    cart.add.and.returnValue(false);
    cart.contains.and.returnValue(false);
    const meta = jasmine.createSpyObj<MetaTrackingService>('MetaTrackingService', ['trackAddToCart']);
    const component = new ProductCard(cart, meta, jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'info']));
    component.product = product;

    component.toggleCart(new Event('click'));

    expect(meta.trackAddToCart).not.toHaveBeenCalled();
  });
});
