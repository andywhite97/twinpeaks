import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../shared/models/product.model';
import { ProductCard } from '../../../../shared/components/product-card/product-card';

@Component({
  standalone: true,
  selector: 'app-featured-products-section',
  imports: [RouterLink, ProductCard],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProductsComponent {
  @Input() products: Product[] = [];
}
