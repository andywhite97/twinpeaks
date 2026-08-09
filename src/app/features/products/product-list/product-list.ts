import { Component, HostListener, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../product';
import { Product } from '../../../shared/models/product.model';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Loader } from '../../../shared/components/loader/loader';
import { ProductCard } from '../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [PageHeader, Loader, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList implements OnInit {
  private readonly pageSize = 9;
  private currentPage = 1;

  products: Product[] = [];
  isLoading = true;
  isLoadingMore = false;
  hasError = false;
  hasMoreProducts = false;
  private category?: string;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.category = params.get('category') ?? undefined;
      this.currentPage = 1;
      this.loadProducts(1);
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.hasMoreProducts || this.isLoadingMore) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const loadThreshold = document.documentElement.scrollHeight - 350;

    if (scrollPosition >= loadThreshold) {
      this.loadMoreProducts();
    }
  }

  loadMoreProducts(): void {
    if (!this.hasMoreProducts || this.isLoadingMore) {
      return;
    }

    this.loadProducts(this.currentPage + 1, true);
  }

  private loadProducts(page: number, append = false): void {
    this.hasError = false;
    this.isLoading = !append;
    this.isLoadingMore = append;

    this.productService.getProducts(page, this.pageSize, this.category).subscribe({
      next: (data) => {
        this.products = append ? [...this.products, ...data.results] : data.results;
        this.currentPage = page;
        this.hasMoreProducts = Boolean(data.next);
        this.isLoading = false;
        this.isLoadingMore = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
        this.isLoadingMore = false;
        this.cdr.markForCheck();
      },
    });
  }
}
