import { Injectable, signal } from '@angular/core';
import { Product } from '../../shared/models/product.model';

interface CartItem { productId: number; quantity: number; }

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly itemCount = signal(0);
  private items: CartItem[] = [];

  constructor() {
    try { this.items = JSON.parse(localStorage.getItem('twinpeaks-cart') ?? '[]'); } catch { this.items = []; }
    this.updateCount();
  }

  add(product: Product): void {
    const item = this.items.find((entry) => entry.productId === product.id);
    if (item) item.quantity += 1; else this.items.push({ productId: product.id, quantity: 1 });
    localStorage.setItem('twinpeaks-cart', JSON.stringify(this.items));
    this.updateCount();
  }

  private updateCount(): void { this.itemCount.set(this.items.reduce((total, item) => total + item.quantity, 0)); }
}
