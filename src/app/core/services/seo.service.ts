import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoData {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  keywords?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private baseUrl = 'https://twinpeaksinvestment.com';
  private defaultOgImage = 'https://twinpeaksinvestment.com/img/og-image.png';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  updateSeoTags(seoData: SeoData): void {
    // Update title
    this.titleService.setTitle(seoData.title);

    // Update or create meta description
    this.metaService.updateTag({
      name: 'description',
      content: seoData.description
    });

    // Update keywords if provided
    if (seoData.keywords) {
      this.metaService.updateTag({
        name: 'keywords',
        content: seoData.keywords
      });
    }

    // Update Open Graph tags
    this.metaService.updateTag({
      property: 'og:title',
      content: seoData.ogTitle || seoData.title
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: seoData.ogDescription || seoData.description
    });

    this.metaService.updateTag({
      property: 'og:image',
      content: seoData.ogImage || this.defaultOgImage
    });

    this.metaService.updateTag({
      property: 'og:url',
      content: seoData.ogUrl || this.baseUrl
    });

    this.metaService.updateTag({
      property: 'og:type',
      content: seoData.ogType || 'website'
    });

    // Update Twitter Card tags
    this.metaService.updateTag({
      name: 'twitter:title',
      content: seoData.ogTitle || seoData.title
    });

    this.metaService.updateTag({
      name: 'twitter:description',
      content: seoData.ogDescription || seoData.description
    });

    this.metaService.updateTag({
      name: 'twitter:image',
      content: seoData.ogImage || this.defaultOgImage
    });
  }

  updateCanonicalUrl(url: string): void {
    let link = this.document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}
