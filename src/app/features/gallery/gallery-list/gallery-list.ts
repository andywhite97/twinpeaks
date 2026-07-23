import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { GalleryItem } from '../../../shared/models/gallery.model';
import { GalleryService } from '../gallery';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Loader } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-gallery-list',
  imports: [PageHeader, Loader],
  templateUrl: './gallery-list.html',
  styleUrl: './gallery-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryList implements OnInit {
  private readonly pageSize = 12;
  private currentPage = 1;

  galleryItems: GalleryItem[] = [];
  isLoading = true;
  isLoadingMore = false;
  hasError = false;
  hasMoreItems = false;

  constructor(
    private galleryService: GalleryService,
    private cdr: ChangeDetectorRef
  ) {}

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
