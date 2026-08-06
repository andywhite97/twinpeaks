import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { HomepageService } from '../../core/services/homepage';
import { HomepageSectionData } from '../../shared/models/homepage.model';
import { HeroComponent } from './components/hero/hero';
import { SolutionsComponent } from './components/solutions/solutions';
import { FeaturedProductsComponent } from './components/featured-products/featured-products';
import { StatisticsComponent } from './components/statistics/statistics';
import { ProjectsComponent } from './components/projects/projects';
import { BrandsComponent } from './components/brands/brands';
import { TestimonialsComponent } from './components/testimonials/testimonials';
import { CtaComponent } from './components/cta/cta';
import { ProductService } from '../products/product';
import { Product } from '../../shared/models/product.model';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [HeroComponent, SolutionsComponent, FeaturedProductsComponent, StatisticsComponent, ProjectsComponent, BrandsComponent, TestimonialsComponent, CtaComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  readonly homepageData = signal<HomepageSectionData | null>(null);
  readonly featuredProducts = signal<Product[]>([]);
  isLoading = signal(true);

  constructor(
    private homepageService: HomepageService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.homepageService.getHomepageData().subscribe({
      next: (data) => {
        this.homepageData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });

    this.productService.getProducts(1, 6).subscribe({
      next: (response) => {
        this.featuredProducts.set(response.results || []);
      }
    });
  }
}
