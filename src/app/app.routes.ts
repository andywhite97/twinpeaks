import { Routes } from '@angular/router';
import { notFoundResolver, projectResolver, solutionResolver } from './core/seo/page-resolvers';

const preview = (heading: string) => ({ heading, title: `${heading} | TwinPeaks Investment`, noindex: true });
const shell = () => import('./features/page-shell/page-shell').then(module => module.PageShell);
export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/home/home').then(module => module.Home), data: {
    title: 'TwinPeaks Investment | Technology, Security & Digital Solutions',
    description: 'Technology, security and digital solutions for businesses and communities in Eswatini. Built on Vision, Driven by Progress.',
  } },
  { path: 'solutions', loadComponent: () => import('./features/solutions/solutions').then(m => m.Solutions), data: { title: 'Technology & Security Solutions | TwinPeaks Investment', description: 'Explore six technology, security and digital solution areas for Eswatini.', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Solutions', path: '/solutions' }] } },
  { path: 'solutions/:slug', loadComponent: () => import('./features/solutions/solution-detail').then(m => m.SolutionDetail), resolve: { content: solutionResolver } },
  { path: 'services', pathMatch: 'full', redirectTo: 'solutions' },
  { path: 'gallery', pathMatch: 'full', redirectTo: 'projects' },
  { path: 'leadership', pathMatch: 'full', redirectTo: 'about' },
  { path: 'projects', loadComponent: () => import('./features/projects/projects').then(m => m.Projects), data: { title: 'Published Projects | TwinPeaks Investment', description: 'Explore published TwinPeaks technology, security and digital projects.', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Projects', path: '/projects' }] } },
  { path: 'projects/:slug', loadComponent: () => import('./features/projects/project-detail').then(m => m.ProjectDetail), resolve: { content: projectResolver }, runGuardsAndResolvers: 'always' },
  { path: 'about', loadComponent: () => import('./features/about/about').then(m => m.About), data: { title: 'About TwinPeaks | TwinPeaks Investment', description: 'An Eswatini-based technology, security and digital solutions company. Built on Vision, Driven by Progress.', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }] } },
  { path: 'contact', loadComponent: () => import('./features/leads/contact').then(m => m.Contact), data: { title: 'Contact Us | TwinPeaks Investment', description: 'Contact TwinPeaks to discuss technology, security and digital solutions in Eswatini.', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }] } },
  { path: 'request-quote', loadComponent: () => import('./features/leads/request-quote').then(m => m.RequestQuote), data: { title: 'Request a Quote | TwinPeaks Investment', description: 'Share your requirements and request a technology, security or digital solution quotation from TwinPeaks.', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Request a Quote', path: '/request-quote' }] } },
  { path: 'quotations/:token', loadComponent: () => import('./features/quotations/public-quotation').then(module => module.PublicQuotation),
    data: { title: 'Your Private Quotation | TwinPeaks Investment', description: 'Review your private TwinPeaks quotation.', noindex: true } },
  { path: 'privacy', loadComponent: shell, data: preview('Privacy') },
  { path: 'terms', loadComponent: shell, data: preview('Terms') },
  { path: '404', loadComponent: () => import('./features/not-found/not-found').then(module => module.NotFound), data: preview('Page Not Found') },
  { path: '**', loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound), resolve: { content: notFoundResolver } },
];
