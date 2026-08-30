import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Product } from '../../shared/models/product.model';

export interface CartItem { product: Product; quantity: number; }

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly itemCount = signal(0);
  readonly items = signal<CartItem[]>([]);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const storedItems = JSON.parse(localStorage.getItem('twinpeaks-cart') ?? '[]');
        this.items.set(Array.isArray(storedItems) ? storedItems.filter((item) => item?.product?.id && item.quantity > 0) : []);
      } catch { this.items.set([]); }
    }
    this.updateCount();
  }

  add(product: Product): void {
    const items = [...this.items()];
    const item = items.find((entry) => entry.product.id === product.id);
    if (item) item.quantity = Math.min(item.quantity + 1, product.stock_quantity); else items.push({ product, quantity: 1 });
    this.items.set(items);
    this.persist(items);
    this.updateCount();
  }

  contains(productId: number): boolean { return this.items().some((item) => item.product.id === productId); }

  remove(product: Product): void {
    const items = this.items().filter((item) => item.product.id !== product.id);
    this.items.set(items);
    this.persist(items);
    this.updateCount();
  }

  setQuantity(productId: number, quantity: number): void {
    const items = this.items().map((item) => item.product.id === productId ? { ...item, quantity: Math.min(Math.max(1, quantity), item.product.stock_quantity) } : item);
    this.items.set(items); this.persist(items); this.updateCount();
  }

  clear(): void { this.items.set([]); this.persist([]); this.updateCount(); }

  get subtotal(): number { return this.items().reduce((total, item) => total + Number(item.product.sale_price ?? item.product.price ?? 0) * item.quantity, 0); }

  private persist(items: CartItem[]): void { if (!isPlatformBrowser(this.platformId)) return; try { localStorage.setItem('twinpeaks-cart', JSON.stringify(items)); } catch { /* Storage is unavailable during SSR or privacy-restricted browsing. */ } }
  private updateCount(): void { this.itemCount.set(this.items().reduce((total, item) => total + item.quantity, 0)); }
}
