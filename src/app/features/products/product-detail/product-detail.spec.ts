import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { CartService } from '../../../core/services/cart';
import { MetaTrackingService } from '../../../core/services/meta-tracking.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SeoService } from '../../../core/services/seo.service';
import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../product';
import { ProductDetail } from './product-detail';

const product: Product = {
  id: 7, name: 'TwinPeaks Pro Package', slug: 'twinpeaks-pro-package', description: '',
  price: 1200, sale_price: 999, stock_quantity: 10, stock_status: 'in_stock',
  rating: 0, installation_available: false, is_featured: false,
};

describe('ProductDetail Meta tracking', () => {
  it('tracks ViewContent only after the product response succeeds', () => {
    const meta = jasmine.createSpyObj<MetaTrackingService>('MetaTrackingService', ['trackViewContent']);
    const component = new ProductDetail(
      { paramMap: of(convertToParamMap({ slug: product.slug })) } as unknown as ActivatedRoute,
      { getProduct: () => of(product), getRelatedProducts: () => of([]) } as unknown as ProductService,
      jasmine.createSpyObj<SeoService>('SeoService', ['updateSeoTags', 'updateCanonicalUrl']),
      jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', ['markForCheck']),
      jasmine.createSpyObj<CartService>('CartService', ['contains', 'add', 'remove']),
      meta,
      jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'info']),
      'browser' as unknown as object,
    );

    component.ngOnInit();

    expect(component.product).toBe(product);
    expect(meta.trackViewContent).toHaveBeenCalledOnceWith(product);
  });

  it('tracks AddToCart only after the detail-page cart insertion succeeds', () => {
    const meta = jasmine.createSpyObj<MetaTrackingService>('MetaTrackingService', ['trackAddToCart']);
    const cart = jasmine.createSpyObj<CartService>('CartService', ['contains', 'add', 'remove']);
    cart.contains.and.returnValue(false);
    cart.add.and.returnValue(true);
    const component = new ProductDetail(
      {} as ActivatedRoute,
      {} as ProductService,
      jasmine.createSpyObj<SeoService>('SeoService', ['updateSeoTags', 'updateCanonicalUrl']),
      jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', ['markForCheck']),
      cart,
      meta,
      jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'info']),
      'browser' as unknown as object,
    );
    component.product = product;

    component.toggleCart();

    expect(cart.add).toHaveBeenCalledWith(product);
    expect(meta.trackAddToCart).toHaveBeenCalledOnceWith(product, 1);
  });
});
