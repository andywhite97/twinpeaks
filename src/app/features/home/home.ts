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
import { FeaturedCategoriesComponent } from './components/featured-categories/featured-categories';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [HeroComponent, SolutionsComponent, FeaturedCategoriesComponent, FeaturedProductsComponent, StatisticsComponent, ProjectsComponent, BrandsComponent, TestimonialsComponent, CtaComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  readonly homepageData = signal<HomepageSectionData | null>(null);
  isLoading = signal(true);

  constructor(
    private homepageService: HomepageService,
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
  }
}
