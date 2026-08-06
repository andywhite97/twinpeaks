export interface HomepageHero {
  hero_heading?: string;
  hero_subheading?: string;
  hero_background_image?: string;
  hero_primary_cta_text?: string;
  hero_primary_cta_url?: string;
  hero_secondary_cta_text?: string;
  hero_secondary_cta_url?: string;
  trust_badges?: string[];
}

export interface HomepageSectionData {
  hero: HomepageHero;
  statistics: HomepageStatistic[];
  featured_products: any[];
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
  short_description: string;
  location?: string;
  category?: string;
  image?: string;
  completion_date?: string;
  link_url?: string;
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
