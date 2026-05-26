export interface CompanyProfile {
  id: number;
  name: string;
  tagline: string;
  overview: string;
  vision: string;
  mission: string;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
}
