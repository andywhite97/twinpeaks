import { isPlatformBrowser } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../product';
import { Product, ProductImage } from '../../../shared/models/product.model';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Loader } from '../../../shared/components/loader/loader';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { SeoService } from '../../../core/services/seo.service';
import { OptimizedImagePipe } from '../../../shared/pipes/optimized-image.pipe';

interface SwiperInstance { destroy(deleteInstance?: boolean, cleanStyles?: boolean): void; }
interface SwiperConstructor { new (element: HTMLElement, options: Record<string, unknown>): SwiperInstance; }
declare global { interface Window { Swiper?: SwiperConstructor; } }

@Component({
  selector: 'app-product-detail',
  imports: [PageHeader, Loader, RouterLink, MarkdownPipe, ProductCard, OptimizedImagePipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail implements OnInit, AfterViewChecked, OnDestroy {
  product: Product | null = null;
  isLoading = true;
  hasError = false;
  selectedImage?: ProductImage;
  relatedProducts: Product[] = [];
  private relatedSwiper?: SwiperInstance;
  private relatedSwiperTimer?: number;
  @ViewChild('relatedSwiperRoot') private relatedSwiperRoot?: ElementRef<HTMLElement>;
  @ViewChild('relatedPreviousButton') private relatedPreviousButton?: ElementRef<HTMLElement>;
  @ViewChild('relatedNextButton') private relatedNextButton?: ElementRef<HTMLElement>;
  @ViewChild('relatedPagination') private relatedPagination?: ElementRef<HTMLElement>;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private seoService: SeoService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngAfterViewChecked(): void { this.queueRelatedSwiper(); }
  ngOnDestroy(): void { if (isPlatformBrowser(this.platformId)) this.destroyRelatedSwiper(); }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.hasError = true;
        this.isLoading = false;
        this.cdr.markForCheck();
        return;
      }

      this.isLoading = true;
      this.hasError = false;
      this.relatedProducts = [];
      this.productService.getProduct(slug).subscribe({
        next: (data) => {
          this.product = data;
          this.selectedImage = undefined;
          this.isLoading = false;
          this.updateProductSeo(data);
          this.cdr.markForCheck();
          this.productService.getRelatedProducts(data.slug).subscribe({
            next: (products) => {
              this.relatedProducts = products;
              this.cdr.markForCheck();
            },
          });
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
    });
  }

  get galleryImages(): ProductImage[] {
    if (!this.product) return [];
    const primaryImage = this.product.image
      ? [{ id: 0, image: this.product.image, alt_text: this.product.name, display_order: -1 }]
      : [];
    return [...primaryImage, ...(this.product.images ?? [])];
  }

  selectImage(image: ProductImage): void {
    this.selectedImage = image;
  }

  get displayedImage(): ProductImage | undefined {
    return this.selectedImage ?? this.galleryImages[0];
  }

  private queueRelatedSwiper(): void {
    if (!isPlatformBrowser(this.platformId) || this.relatedSwiperTimer || this.relatedSwiper || !this.relatedSwiperRoot || this.relatedProducts.length < 2) return;
    this.relatedSwiperTimer = window.setTimeout(() => {
      this.relatedSwiperTimer = undefined;
      if (!this.relatedSwiperRoot || !window.Swiper) return;
      this.relatedSwiper = new window.Swiper(this.relatedSwiperRoot.nativeElement, {
        slidesPerView: 2,
        spaceBetween: 12,
        navigation: { prevEl: this.relatedPreviousButton?.nativeElement, nextEl: this.relatedNextButton?.nativeElement },
        pagination: { el: this.relatedPagination?.nativeElement, clickable: true },
        breakpoints: { 576: { slidesPerView: 2, spaceBetween: 16 }, 768: { slidesPerView: 3, spaceBetween: 20 }, 1200: { slidesPerView: 4, spaceBetween: 24 } },
      });
    });
  }

  private destroyRelatedSwiper(): void {
    if (this.relatedSwiperTimer) window.clearTimeout(this.relatedSwiperTimer);
    this.relatedSwiperTimer = undefined;
    this.relatedSwiper?.destroy(true, true);
    this.relatedSwiper = undefined;
  }

  private updateProductSeo(product: Product): void {
    const productUrl = `https://twinpeaksinvestment.com/products/${encodeURIComponent(product.slug)}`;
    const description = this.toPlainText(product.description) || `Explore ${product.name} from Twinpeaks.`;
    const keywords = [product.name, product.brand?.name, product.category?.name, 'Twinpeaks products']
      .filter((value): value is string => Boolean(value))
      .join(', ');

    this.seoService.updateSeoTags({
      title: `${product.name} | Twinpeaks`,
      description,
      ogImage: this.toAbsoluteUrl(product.image),
      ogUrl: productUrl,
      ogType: 'product',
      keywords,
    });
    this.seoService.updateCanonicalUrl(productUrl);
  }

  private toPlainText(value: string): string {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/[*_#`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);
  }

  private toAbsoluteUrl(url?: string): string | undefined {
    if (!url) return undefined;
    return new URL(url, 'https://twinpeaksinvestment.com').toString();
  }
}
