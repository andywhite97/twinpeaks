import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { Product } from '../../shared/models/product.model';
import { PaginatedResponse } from '../../shared/models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  getProducts(page = 1, pageSize = 9, category?: string, brand?: string) {
    const categoryQuery = category ? `&category=${encodeURIComponent(category)}` : '';
    const brandQuery = brand ? `&brand=${encodeURIComponent(brand)}` : '';
    return this.api.get<PaginatedResponse<Product>>(`products/?page=${page}&page_size=${pageSize}${categoryQuery}${brandQuery}`);
  }

  getProduct(slug: string) {
    return this.api.get<Product>(`products/${slug}/`);
  }
}
