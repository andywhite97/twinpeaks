import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { CartItem } from './cart';
import { CheckoutPayment } from './checkout';
import { Product } from '../../shared/models/product.model';

type MetaStandardEvent = 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';
type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean; version?: string };

declare global { interface Window { fbq?: Fbq; _fbq?: Fbq; } }

@Injectable({ providedIn: 'root' })
export class MetaTrackingService {
  private lastPageUrl?: string;
  private scriptRequested = false;
  private readonly pixelId = environment.metaPixelId;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  initialize(): void {
    if (!this.enabled) return;

    const { fbq, created } = this.getFbq();
    // An existing fbq belongs to the installed Pixel snippet, so do not
    // initialize the dataset a second time.
    if (created) fbq('init', this.pixelId);
    this.loadPixelScript();
    this.debug('fbq available', { queued: Boolean(fbq.queue?.length) });
  }

  trackPageView(url: string): void {
    if (url === this.lastPageUrl) return;
    this.lastPageUrl = url;
    this.track('PageView', {}, this.eventId());
  }

  trackViewContent(product: Product): void {
    this.debug('ViewContent requested', { productId: product.slug });
    this.trackProduct('ViewContent', product, 1);
  }

  trackAddToCart(product: Product, quantity: number): void {
    this.debug('AddToCart requested', { productId: product.slug, quantity });
    this.trackProduct('AddToCart', product, quantity);
  }

  trackInitiateCheckout(items: CartItem[]): void {
    this.debug('InitiateCheckout requested', { itemCount: items.length });
    this.track('InitiateCheckout', this.cartPayload(items), this.eventId());
  }

  trackPurchase(payment: CheckoutPayment, items: CartItem[]): void {
    this.track('Purchase', { ...this.cartPayload(items), value: Number(payment.amount), currency: payment.currency }, payment.meta_event_id);
  }

  eventId(): string {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private trackProduct(event: 'ViewContent' | 'AddToCart', product: Product, quantity: number): void {
    if (!product.slug) {
      this.debug(`${event} skipped: product has no catalog slug`);
      return;
    }

    const price = this.sellingPrice(product);
    this.track(event, {
      content_ids: [product.slug],
      content_type: 'product',
      content_name: product.name,
      contents: [{ id: product.slug, quantity, item_price: price }],
      value: price,
      currency: 'SZL',
    }, this.eventId());
  }

  private cartPayload(items: CartItem[]): Record<string, unknown> {
    const contents = items.map((item) => ({
      id: item.product.slug,
      quantity: item.quantity,
      item_price: this.sellingPrice(item.product),
    }));
    return {
      content_ids: contents.map((item) => item.id),
      content_type: 'product',
      contents,
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      value: contents.reduce((sum, item) => sum + item.item_price * item.quantity, 0),
      currency: 'SZL',
    };
  }

  private track(event: MetaStandardEvent, data: Record<string, unknown>, eventId: string): void {
    if (!this.enabled) {
      this.debug(`${event} skipped: tracking is disabled`);
      return;
    }

    try {
      this.initialize();
      const fbq = window.fbq;
      if (!fbq) {
        this.debug(`${event} not sent: fbq unavailable`);
        return;
      }

      // Standard Meta Pixel API. The local queue preserves calls made before
      // fbevents.js has finished loading.
      fbq('track', event, data, { eventID: eventId });
      this.debug(`${event} sent`, { fbqAvailable: true });
    } catch (error) {
      this.debug(`${event} not sent: fbq dispatch failed`, { error: String(error) });
    }
  }

  private getFbq(): { fbq: Fbq; created: boolean } {
    if (window.fbq) return { fbq: window.fbq, created: false };

    const fbq = ((...args: unknown[]) => { (fbq.queue ??= []).push(args); }) as Fbq;
    Object.assign(fbq, { loaded: true, version: '2.0', queue: [] as unknown[][] });
    window.fbq = fbq;
    window._fbq = fbq;
    return { fbq, created: true };
  }

  private loadPixelScript(): void {
    if (this.scriptRequested || document.querySelector('script[data-twinpeaks-meta-pixel]')) return;
    this.scriptRequested = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.dataset['twinpeaksMetaPixel'] = 'true';
    document.head.appendChild(script);
  }

  private sellingPrice(product: Product): number { return Number(product.sale_price ?? product.price ?? 0); }
  private get enabled(): boolean { return isPlatformBrowser(this.platformId) && Boolean(this.pixelId); }
  private debug(message: string, details?: Record<string, unknown>): void {
    if (environment.metaDebug) console.debug(`[Meta Pixel] ${message}`, details ?? '');
  }
}
