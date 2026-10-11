import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  update(path: string, title: string, description: string, noindex = false, breadcrumbs: readonly { name: string; path: string }[] = [], image = ''): void {
    const privateQuote = /^\/quotations\//i.test(path);
    const canonical = environment.siteUrl + (privateQuote ? '/quotations' : path.split(/[?#]/)[0]);
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: noindex || privateQuote ? 'noindex, nofollow' : 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.removeTag('property="og:image"');
    if (image && !privateQuote) this.meta.updateTag({ property: 'og:image', content: image });
    this.document.getElementById('page-breadcrumb-schema')?.remove();
    if (breadcrumbs.length && !privateQuote) {
      const schema = this.document.createElement('script'); schema.id = 'page-breadcrumb-schema'; schema.type = 'application/ld+json';
      schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: environment.siteUrl + item.path })) }).replace(/</g, '\\u003c');
      this.document.head.appendChild(schema);
    }
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = this.document.createElement('link'); link.rel = 'canonical'; this.document.head.appendChild(link); }
    link.href = canonical;
  }
}
