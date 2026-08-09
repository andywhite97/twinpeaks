import { Product, ProductCategory } from './product.model';

export interface HomepageHero {
  hero_heading?: string;
  hero_subheading?: string;
  hero_background_image?: string;
  hero_primary_cta_text?: string;
  hero_primary_cta_url?: string;
  hero_secondary_cta_text?: string;
  hero_secondary_cta_url?: string;
  trust_badges?: string[];
  cta_heading?: string;
  cta_subheading?: string;
  cta_background_image?: string;
  cta_primary_button_text?: string;
  cta_primary_button_url?: string;
  cta_secondary_button_text?: string;
  cta_secondary_button_url?: string;
}

export interface HomepageSectionData {
  hero: HomepageHero;
  statistics: HomepageStatistic[];
  featured_products: Product[];
  featured_categories: ProductCategory[];
  solutions: HomepageSolution[];
  projects: HomepageProject[];
  brands: HomepageBrand[];
  testimonials: HomepageTestimonial[];
  settings: HomepageHero;
}

export interface HomepageStatistic {
  id: number;
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
}

export interface HomepageSolution {
  id: number;
  title: string;
  description: string;
  icon?: string;
  button_text?: string;
  button_url?: string;
}

export interface HomepageProject {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  long_description?: string;
  location?: string;
  category?: string;
  image?: string;
  completion_date?: string;
  link_url?: string;
  images?: HomepageProjectImage[];
}

export interface HomepageProjectImage {
  id: number;
  image: string;
  caption?: string;
  display_order: number;
}

export interface HomepageBrand {
  id: number;
  name: string;
  logo?: string;
  website?: string;
}

export interface HomepageTestimonial {
  id: number;
  customer_name: string;
  business?: string;
  photo?: string;
  rating: number;
  review: string;
}
