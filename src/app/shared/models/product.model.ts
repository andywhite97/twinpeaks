export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  is_featured: boolean;
  display_order: number;
}

export interface ProductBrand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
  display_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price?: number;
  sale_price?: number;
  image?: string;
  images?: ProductImage[];
  category?: ProductCategory | null;
  brand?: ProductBrand | null;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock';
  rating: number;
  installation_available: boolean;
  is_featured: boolean;
}
