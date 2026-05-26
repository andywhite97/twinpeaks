export interface GalleryItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
  image: string;
  display_order: number;
  created_at: string;
}
