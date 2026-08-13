import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../product';
import { Product, ProductImage } from '../../../shared/models/product.model';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Loader } from '../../../shared/components/loader/loader';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';
import { ProductCard } from '../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-detail',
  imports: [PageHeader, Loader, RouterLink, MarkdownPipe, ProductCard],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  isLoading = true;
  hasError = false;
  selectedImage?: ProductImage;
  relatedProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
  ) {}

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
}
