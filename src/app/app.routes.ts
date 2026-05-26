import { Routes } from '@angular/router';
import { ProductList } from './features/products/product-list/product-list';
import { Home } from './features/home/home';
import { LeadershipList } from './features/leadership/leadership-list/leadership-list';
import { ServiceList } from './features/services/service-list/service-list';
import { Contact } from './features/contact/contact';
import { GalleryList } from './features/gallery/gallery-list/gallery-list';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: ProductList },
  { path: 'services', component: ServiceList },
  { path: 'gallery', component: GalleryList },
  { path: 'about', component: LeadershipList },
  { path: 'leadership', redirectTo: 'about' },
  { path: 'contact', component: Contact },
  { path: '**', redirectTo: '' }
];
