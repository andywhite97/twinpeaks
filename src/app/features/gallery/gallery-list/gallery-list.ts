import { Component, OnInit } from '@angular/core';
import { GalleryItem } from '../../../shared/models/gallery.model';
import { GalleryService } from '../gallery';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-gallery-list',
  imports: [PageHeader],
  templateUrl: './gallery-list.html',
  styleUrl: './gallery-list.css',
})
export class GalleryList implements OnInit {
  private readonly pageSize = 12;
  private currentPage = 1;

  galleryItems: GalleryItem[] = [];
  isLoading = true;
  isLoadingMore = false;
  hasError = false;
  hasMoreItems = false;

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    this.loadGalleryItems(1);
  }

  loadMoreGalleryItems(): void {
    if (!this.hasMoreItems || this.isLoadingMore) {
      return;
    }

    this.loadGalleryItems(this.currentPage + 1, true);
  }

  getCollapseId(item: GalleryItem): string {
    return `gallery-item-${item.id}`;
  }

  private loadGalleryItems(page: number, append = false): void {
    this.hasError = false;
    this.isLoading = !append;
    this.isLoadingMore = append;

    this.galleryService.getGalleryItems(page, this.pageSize).subscribe({
      next: (data) => {
        this.galleryItems = append ? [...this.galleryItems, ...data.results] : data.results;
        this.currentPage = page;
        this.hasMoreItems = Boolean(data.next);
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
    });
  }
}
