import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { Product, ProductBrand, ProductCategory } from '../../shared/models/product.model';
import { PaginatedResponse } from '../../shared/models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  getProducts(page = 1, pageSize = 9, category?: string, brand?: string, sort?: string) {
    const categoryQuery = category ? `&category=${encodeURIComponent(category)}` : '';
    const brandQuery = brand ? `&brand=${encodeURIComponent(brand)}` : '';
    const sortQuery = sort ? `&sort=${encodeURIComponent(sort)}` : '';
    return this.api.get<PaginatedResponse<Product>>(`products/?page=${page}&page_size=${pageSize}${categoryQuery}${brandQuery}${sortQuery}`);
  }

  getCategories() { return this.api.get<ProductCategory[]>('categories/'); }
  getBrands() { return this.api.get<ProductBrand[]>('brands/'); }

  getProduct(slug: string) {
    return this.api.get<Product>(`products/${slug}/`);
  }
}
