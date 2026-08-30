import { isPlatformBrowser } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, Inject, Input, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCategory } from '../../../../shared/models/product.model';

interface SwiperInstance { destroy(deleteInstance?: boolean, cleanStyles?: boolean): void; }
interface SwiperConstructor { new (element: HTMLElement, options: Record<string, unknown>): SwiperInstance; }
declare global { interface Window { Swiper?: SwiperConstructor; } }

@Component({ standalone: true, selector: 'app-featured-categories-section', imports: [RouterLink], templateUrl: './featured-categories.html', styleUrl: './featured-categories.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class FeaturedCategoriesComponent implements AfterViewChecked, OnDestroy {
  private categoryItems: ProductCategory[] = [];
  private swiper?: SwiperInstance;
  private initialiseTimer?: number;
  @ViewChild('categorySwiperRoot') private categorySwiperRoot?: ElementRef<HTMLElement>;
  @ViewChild('categoryPagination') private categoryPagination?: ElementRef<HTMLElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  @Input() set categories(value: ProductCategory[] | null | undefined) { this.categoryItems = value ?? []; this.queueInitialisation(); }
  get categories(): ProductCategory[] { return this.categoryItems; }

  ngAfterViewChecked(): void { this.queueInitialisation(); }
  ngOnDestroy(): void { if (isPlatformBrowser(this.platformId)) this.destroySwiper(); }

  fallbackImage(name: string): string { return `https://placehold.co/600x400?text=${encodeURIComponent(name)}`; }
  useFallbackImage(event: Event, name: string): void { const image = event.target as HTMLImageElement; image.onerror = null; image.src = this.fallbackImage(name); }

  private queueInitialisation(): void {
    if (!isPlatformBrowser(this.platformId) || this.initialiseTimer || this.swiper || !this.categorySwiperRoot || this.categories.length < 2) return;
    this.initialiseTimer = window.setTimeout(() => {
      this.initialiseTimer = undefined;
      if (!this.categorySwiperRoot || !window.Swiper) return;
      this.swiper = new window.Swiper(this.categorySwiperRoot.nativeElement, {
        slidesPerView: 1.16, spaceBetween: 12,
        pagination: { el: this.categoryPagination?.nativeElement, clickable: true },
        breakpoints: { 480: { slidesPerView: 1.3, spaceBetween: 14 }, 576: { slidesPerView: 2, spaceBetween: 16 }, 992: { slidesPerView: 3, spaceBetween: 20 }, 1200: { slidesPerView: 4, spaceBetween: 20 } },
      });
    });
  }

  private destroySwiper(): void {
    if (this.initialiseTimer) window.clearTimeout(this.initialiseTimer);
    this.initialiseTimer = undefined;
    this.swiper?.destroy(true, true);
    this.swiper = undefined;
  }
}
