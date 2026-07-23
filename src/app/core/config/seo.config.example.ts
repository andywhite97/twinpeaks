// SEO Configuration Template
// Copy this file to: src/app/core/config/seo.config.ts
// Update with your actual business information

export const SEO_CONFIG = {
  // Basic Information
  businessName: 'Twinpeaks Investment',
  businessUrl: 'https://twinpeaksinvestment.com',
  businessDescription: 'Expert financial advisory, wealth management, and investment solutions.',

  // Contact Information
  contact: {
    phone: '+1-XXX-XXX-XXXX',           // UPDATE: Your phone number
    email: 'info@twinpeaksinvestment.com',    // UPDATE: Your email
    address: {
      streetAddress: '123 Main Street',       // UPDATE: Your street address
      addressLocality: 'New York',            // UPDATE: Your city
      addressRegion: 'NY',                    // UPDATE: Your state/region
      postalCode: '10001',                    // UPDATE: Your ZIP code
      addressCountry: 'US'
    }
  },

  // Social Media Links
  social: {
    facebook: 'https://www.facebook.com/twinpeaks',      // UPDATE: Your Facebook
    linkedin: 'https://www.linkedin.com/company/twinpeaks',  // UPDATE: Your LinkedIn
    twitter: 'https://twitter.com/twinpeaks',            // UPDATE: Your Twitter
    instagram: 'https://instagram.com/twinpeaks',        // UPDATE: Your Instagram
  },

  // Images
  images: {
    logo: 'https://twinpeaksinvestment.com/img/logo.png',
    ogImage: 'https://twinpeaksinvestment.com/img/og-image.png',
    favicon: '/favicon.ico'
  },

  // Analytics
  analytics: {
    googleAnalyticsId: 'G-XXXXXXXXXX',  // UPDATE: Your Google Analytics ID
    googleAdwordsConversionId: '',      // UPDATE: If using Google Ads
  },

  // Business Hours (Optional)
  businessHours: {
    Monday: { opens: '09:00', closes: '17:00' },
    Tuesday: { opens: '09:00', closes: '17:00' },
    Wednesday: { opens: '09:00', closes: '17:00' },
    Thursday: { opens: '09:00', closes: '17:00' },
    Friday: { opens: '09:00', closes: '17:00' },
    Saturday: 'Closed',
    Sunday: 'Closed'
  },

  // Keywords
  keywords: {
    home: 'investment, financial advisory, wealth management',
    products: 'investment products, financial solutions, portfolio management',
    services: 'financial planning, wealth management, investment advisory',
    gallery: 'case studies, investment strategies, portfolio examples',
    about: 'about us, leadership team, investment expertise',
    contact: 'contact, inquiry, financial advisor'
  },

  // Page Titles
  titles: {
    home: 'Twinpeaks Investment | Financial Advisory & Wealth Management',
    products: 'Products | Twinpeaks Investment',
    services: 'Services | Twinpeaks Investment',
    gallery: 'Gallery | Twinpeaks Investment',
    about: 'About Us | Twinpeaks Investment',
    contact: 'Contact Us | Twinpeaks Investment',
    notFound: '404 Page Not Found | Twinpeaks Investment'
  },

  // Page Descriptions
  descriptions: {
    home: 'Welcome to Twinpeaks Investment. Expert financial advisory, wealth management, and investment solutions.',
    products: 'Explore our comprehensive range of investment products and solutions tailored to your financial goals.',
    services: 'Our professional services include financial planning, wealth management, and investment advisory.',
    gallery: 'View our project gallery and case studies showcasing successful investment strategies.',
    about: 'Meet our experienced leadership team dedicated to your financial success.',
    contact: 'Get in touch with our team. We\'re here to answer your questions about our services.',
    notFound: 'The page you are looking for does not exist.'
  },

  // Organization Schema
  organization: {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Twinpeaks Investment',
    url: 'https://twinpeaksinvestment.com',
    telephone: '+1-XXX-XXX-XXXX',  // UPDATE
    email: 'info@twinpeaksinvestment.com',  // UPDATE
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main Street',  // UPDATE
      addressLocality: 'New York',       // UPDATE
      addressRegion: 'NY',               // UPDATE
      postalCode: '10001',               // UPDATE
      addressCountry: 'US'
    },
    priceRange: '$$$$',
    description: 'Expert financial advisory and wealth management solutions.',
    sameAs: [
      'https://www.facebook.com/twinpeaks',    // UPDATE
      'https://www.linkedin.com/company/twinpeaks',  // UPDATE
      'https://twitter.com/twinpeaks'          // UPDATE
    ]
  }
};

// Usage in components:
//
// import { SEO_CONFIG } from './config/seo.config';
//
// this.seoService.updateSeoTags({
//   title: SEO_CONFIG.titles.home,
//   description: SEO_CONFIG.descriptions.home,
//   keywords: SEO_CONFIG.keywords.home
// });
//
// this.structuredDataService.injectOrganizationSchema(
//   SEO_CONFIG.organization
// );
