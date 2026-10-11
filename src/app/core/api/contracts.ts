/** Mirrors the inspected Django serializers; optional/nullable fields remain explicit. */
export interface CompanyProfile {
  id: number; name: string; logo: string | null; tagline: string; overview: string; vision: string; mission: string;
  facebook: string | null; twitter: string | null; instagram: string | null; linkedin: string | null;
  email: string; phone: string; whatsapp: string; address: string; business_hours: string; copyright_text: string;
}
export interface ServiceDto { id: number; title: string; description: string; icon: string | null; }
export interface ProjectImageDto { id: number; image: string; caption: string; display_order: number; }
export interface ProjectDto {
  id: number; title: string; slug: string; short_description: string; long_description: string; location: string;
  category: string; image: string; images: ProjectImageDto[]; completion_date: string | null; link_url: string;
}
export interface HomepageSettingsDto {
  hero_heading: string; hero_subheading: string; hero_background_image: string | null;
  hero_primary_cta_text: string; hero_primary_cta_url: string; hero_secondary_cta_text: string; hero_secondary_cta_url: string;
  trust_badges: string[]; cta_heading: string; cta_subheading: string; cta_background_image: string | null;
  cta_primary_button_text: string; cta_primary_button_url: string; cta_secondary_button_text: string; cta_secondary_button_url: string;
}
export interface HomepageSolutionDto { id: number; title: string; description: string; icon: string; button_text: string; button_url: string; }
/** Marketing subset of the aggregate response; commerce/testimonials/statistics are intentionally not rendered. */
export interface HomepageDto {
  hero: Partial<HomepageSettingsDto>; settings: Partial<HomepageSettingsDto>;
  solutions: HomepageSolutionDto[]; projects: ProjectDto[];
}
export interface ContactRequest { name: string; email: string; message: string; }
export interface ContactResponse extends ContactRequest { id: number; created_at: string; }
export type QuotationStatus = 'draft' | 'requested' | 'under_review' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired' | 'converted_to_order' | 'cancelled';
export interface PublicQuotationItem {
  title: string; description: string; quantity: number; unit_price: string; discount_amount: string; tax_amount: string; line_total: string;
}
export interface PublicQuotationDto {
  quote_number: string; name: string; company_name: string; email: string; phone_number: string; address: string; message: string;
  status: QuotationStatus; subtotal?: string; discount_amount?: string; tax_amount?: string; total?: string; currency?: string;
  terms?: string; valid_until?: string | null; created_at: string; sent_at: string | null; viewed_at: string | null;
  accepted_at: string | null; declined_at: string | null; decline_reason: string; items?: PublicQuotationItem[];
}
export type QuotationRequestItem = { quantity: number } & ({ service_id: number } | { product_id: number } | { description: string });
export interface QuotationRequest {
  name: string; email: string; phone_number: string; company_name?: string; address?: string; message?: string; items: QuotationRequestItem[];
}
export interface QuotationRequestResponse { quote_number: string; public_access_token: string; status: QuotationStatus; }
export type RequestState = 'loading' | 'ready' | 'error';
