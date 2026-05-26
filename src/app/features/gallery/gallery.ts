import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api';
import { GalleryItem } from '../../shared/models/gallery.model';
import { PaginatedResponse } from '../../shared/models/paginated-response.model';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  constructor(private api: ApiService) {}

  getGalleryItems(page = 1, pageSize = 12) {
    return this.api.get<PaginatedResponse<GalleryItem>>(`gallery/?page=${page}&page_size=${pageSize}`);
  }

  getGalleryItem(slug: string) {
    return this.api.get<GalleryItem>(`gallery/${slug}/`);
  }
}
