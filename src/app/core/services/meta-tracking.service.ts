import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CartItem } from './cart';
import { CheckoutPayment } from './checkout';
import { Product } from '../../shared/models/product.model';

declare global { interface Window { fbq?: (...args: unknown[]) => void; _fbq?: unknown; } }

@Injectable({ providedIn: 'root' })
export class MetaTrackingService {
  private lastPageUrl?: string;
  private readonly pixelId = environment.metaPixelId;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  initialize(): void {
    if (!this.enabled || window.fbq) return;
    const fbq: ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean; version?: string } = (...args: unknown[]) => { (fbq.queue ??= []).push(args); };
    Object.assign(fbq, { loaded: true, version: '2.0', queue: [] as unknown[][] });
    window.fbq = fbq; window._fbq = fbq;
    const script = document.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
    window.fbq('init', this.pixelId);
  }

  trackPageView(url: string): void {
    if (url === this.lastPageUrl) return;
    this.lastPageUrl = url;
    this.track('PageView', {}, this.eventId());
  }

  trackViewContent(product: Product): void { this.trackProduct('ViewContent', product, 1); }
  trackAddToCart(product: Product, quantity: number): void { this.trackProduct('AddToCart', product, quantity); }

  trackInitiateCheckout(items: CartItem[]): void {
    const eventId = this.eventId();
    this.track('InitiateCheckout', this.cartPayload(items), eventId);
  }

  trackPurchase(payment: CheckoutPayment, items: CartItem[]): void {
    this.track('Purchase', { ...this.cartPayload(items), value: Number(payment.amount), currency: payment.currency }, payment.meta_event_id);
  }

  eventId(): string { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }

  private trackProduct(event: string, product: Product, quantity: number) {
    const price = Number(product.sale_price ?? product.price ?? 0);
    this.track(event, { content_ids: [product.slug], content_type: 'product', content_name: product.name, value: price, currency: 'SZL', contents: [{ id: product.slug, quantity, item_price: price }] }, this.eventId());
  }

  private cartPayload(items: CartItem[]) {
    const contents = items.map((item) => ({ id: item.product.slug, quantity: item.quantity, item_price: Number(item.product.sale_price ?? item.product.price ?? 0) }));
    return { content_ids: contents.map((item) => item.id), content_type: 'product', contents, num_items: items.reduce((sum, item) => sum + item.quantity, 0), value: this.cart.subtotal(items), currency: 'SZL' };
  }

  private cart = { subtotal: (items: CartItem[]) => items.reduce((sum, item) => sum + Number(item.product.sale_price ?? item.product.price ?? 0) * item.quantity, 0) };
  private track(event: string, data: Record<string, unknown>, eventId: string) { if (this.enabled) { try { this.initialize(); window.fbq?.('track', event, data, { eventID: eventId }); } catch { /* tracking must not affect commerce */ } } }
  private get enabled() { return isPlatformBrowser(this.platformId) && Boolean(this.pixelId); }
}
