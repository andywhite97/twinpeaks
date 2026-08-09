import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCategory } from '../../../../shared/models/product.model';

@Component({ standalone: true, selector: 'app-featured-categories-section', imports: [RouterLink], templateUrl: './featured-categories.html', styleUrl: './featured-categories.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class FeaturedCategoriesComponent {
  @Input() categories: ProductCategory[] = [];

  fallbackImage(name: string): string { return `https://placehold.co/600x400?text=${encodeURIComponent(name)}`; }
  useFallbackImage(event: Event, name: string): void { const image = event.target as HTMLImageElement; image.onerror = null; image.src = this.fallbackImage(name); }
}
