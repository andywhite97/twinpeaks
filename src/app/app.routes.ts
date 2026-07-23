import { Routes } from '@angular/router';
import { ProductList } from './features/products/product-list/product-list';
import { Home } from './features/home/home';
import { LeadershipList } from './features/leadership/leadership-list/leadership-list';
import { ServiceList } from './features/services/service-list/service-list';
import { Contact } from './features/contact/contact';
import { GalleryList } from './features/gallery/gallery-list/gallery-list';
import { NotFound } from './features/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    data: {
      title: 'Twinpeaks | Creative & Technology Solutions',
      description: 'Twinpeaks delivers creative branding, digital solutions, web development, and custom software. Empowering businesses with innovative technology across Africa.',
      keywords: 'creative agency, web design, branding, digital solutions, software development, graphic design'
    }
  },
  {
    path: 'products',
    component: ProductList,
    data: {
      title: 'Products & Solutions | Twinpeaks',
      description: 'Explore our range of creative and technology products: branding kits, design templates, custom software, and digital platform solutions.',
      keywords: 'design products, software solutions, digital tools, technology products'
    }
  },
  {
    path: 'services',
    component: ServiceList,
    data: {
      title: 'Services | Twinpeaks',
      description: 'Our services include branding & graphic design, website development, custom software, digital marketing, printing, and smart technology solutions.',
      keywords: 'branding, graphic design, web development, software development, digital marketing, creative services'
    }
  },
  {
    path: 'gallery',
    component: GalleryList,
    data: {
      title: 'Portfolio & Case Studies | Twinpeaks',
      description: 'Discover our portfolio of successful projects showcasing creative design, web development, branding, and technology solutions.',
      keywords: 'portfolio, case studies, project gallery, design work, web projects'
    }
  },
  {
    path: 'about',
    component: LeadershipList,
    data: {
      title: 'About Us | Twinpeaks',
      description: 'Learn about Twinpeaks, our mission, vision, and experienced team dedicated to creative excellence and innovative technology solutions.',
      keywords: 'about us, our team, company mission, creative agency, company values'
    }
  },
  {
    path: 'leadership',
    redirectTo: 'about'
  },
  {
    path: 'contact',
    component: Contact,
    data: {
      title: 'Contact Us | Twinpeaks',
      description: 'Get in touch with our creative team. Contact us for branding, web development, design, or custom software inquiries.',
      keywords: 'contact us, get in touch, creative agency, design inquiry'
    }
  },
  {
    path: '404',
    component: NotFound,
    data: {
      title: '404 Page Not Found | Twinpeaks',
      description: 'The page you are looking for does not exist. Please return to our site to explore our services.'
    }
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];
