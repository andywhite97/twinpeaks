import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../../core/services/cart';
import { OptimizedImagePipe } from '../../pipes/optimized-image.pipe';

@Component({ standalone: true, selector: 'app-product-card', imports: [DecimalPipe, RouterLink, OptimizedImagePipe], templateUrl: './product-card.html', styleUrl: './product-card.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class ProductCard {
  @Input({ required: true }) product!: Product;
  addedToCart = false;
  constructor(private cartService: CartService) {}
  get hasPrice(): boolean { return this.product.price !== undefined && this.product.price !== null; }
  get hasSalePrice(): boolean { return this.product.sale_price !== undefined && this.product.sale_price !== null; }
  get summary(): string { const description = this.product.description?.trim() ?? ''; return description.length > 130 ? `${description.slice(0, 127).trimEnd()}…` : description; }
  useFallbackImage(event: Event): void { const image = event.target as HTMLImageElement; image.onerror = null; image.src = 'https://placehold.co/600x400?text=Twinpeaks'; }
  get isInCart(): boolean { return this.cartService.contains(this.product.id); }
  toggleCart(event: Event): void { event.stopPropagation(); if (this.product.stock_status === 'out_of_stock') return; if (this.isInCart) { this.cartService.remove(this.product); this.addedToCart = false; return; } this.cartService.add(this.product); this.addedToCart = true; window.setTimeout(() => this.addedToCart = false, 1800); }
  stars(rating: number): string { return '★'.repeat(Math.max(0, Math.min(5, Math.round(rating)))); }
}
