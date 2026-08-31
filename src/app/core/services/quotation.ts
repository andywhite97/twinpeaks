import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { Service } from '../../shared/models/services.model';

export interface QuoteBasketItem {
  key: string;
  product_id?: number;
  service_id?: number;
  description?: string;
  title: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private readonly storageKey = 'twinpeaks-quote-basket';
  readonly items = signal<QuoteBasketItem[]>(this.restore());
  readonly itemCount = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));

  addProduct(product: Product): void {
    this.add({ key: `product:${product.id}`, product_id: product.id, title: product.name, quantity: 1 });
  }

  addService(service: Service): void {
    this.add({ key: `service:${service.id}`, service_id: service.id, title: service.title, quantity: 1 });
  }

  addCustomRequirement(description: string): void {
    const cleanDescription = description.trim();
    if (!cleanDescription) return;
    this.add({ key: `custom:${cleanDescription}`, description: cleanDescription, title: cleanDescription, quantity: 1 });
  }

  updateQuantity(key: string, quantity: number): void {
    if (quantity < 1) return this.remove(key);
    this.items.update((items) => items.map((item) => item.key === key ? { ...item, quantity } : item));
    this.persist();
  }

  remove(key: string): void {
    this.items.update((items) => items.filter((item) => item.key !== key));
    this.persist();
  }

  clear(): void { this.items.set([]); this.persist(); }

  private add(newItem: QuoteBasketItem): void {
    this.items.update((items) => {
      const current = items.find((item) => item.key === newItem.key);
      return current
        ? items.map((item) => item.key === newItem.key ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, newItem];
    });
    this.persist();
  }

  private restore(): QuoteBasketItem[] {
    if (typeof localStorage === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(this.storageKey) ?? '[]'); } catch { return []; }
  }

  private persist(): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
  }
}
