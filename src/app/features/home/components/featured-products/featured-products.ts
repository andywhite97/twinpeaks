import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../shared/models/product.model';

@Component({
  standalone: true,
  selector: 'app-featured-products-section',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProductsComponent {
  @Input() products: Product[] = [];
}
