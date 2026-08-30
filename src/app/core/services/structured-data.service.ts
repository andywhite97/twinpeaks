import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StructuredDataService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  injectOrganizationSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'Twinpeaks',
      url: 'https://twinpeaksinvestment.com',
      logo: 'https://twinpeaksinvestment.com/img/logo.png',
      email: 'info@twinpeaksinvestment.com',
      description: 'Twinpeaks is a creative and technology-driven company specializing in branding, digital solutions, web development, graphic design, and custom software for businesses across Africa.',
      foundingDate: '2015',
      areaServed: [
        {
          '@type': 'Country',
          name: 'Eswatini'
        },
        {
          '@type': 'Country',
          name: 'South Africa'
        },
        {
          '@type': 'Country',
          name: 'Botswana'
        }
      ],
      knowsAbout: [
        'Branding',
        'Graphic Design',
        'Web Development',
        'Digital Marketing',
        'Custom Software Development',
        'UI/UX Design',
        'Digital Solutions',
        'Printing & Promotional Media'
      ],
      sameAs: []
    };

    this.injectSchema(schema);
  }

  injectLocalBusinessSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Twinpeaks',
      image: 'https://twinpeaksinvestment.com/img/logo.png',
      description: 'Creative and technology-driven company specializing in branding, digital solutions, web development, graphic design, and custom software across Africa.',
      url: 'https://twinpeaksinvestment.com',
      areaServed: [
        {
          '@type': 'Country',
          name: 'Eswatini'
        },
        {
          '@type': 'Country',
          name: 'South Africa'
        },
        {
          '@type': 'Country',
          name: 'Botswana'
        }
      ]
    };

    this.injectSchema(schema);
  }

  injectBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]): void {
    const items = breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items
    };

    this.injectSchema(schema);
  }

  private injectSchema(schema: any): void {
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }
}
