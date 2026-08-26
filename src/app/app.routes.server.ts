import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { firstValueFrom } from 'rxjs';

import { ProductService } from './features/products/product';
import { ProjectService } from './features/projects/project';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const productService = inject(ProductService);

      const firstPage = await firstValueFrom(
        productService.getProducts(1, 24)
      );

      const pageCount = Math.ceil(firstPage.count / 24);

      const remainingPages = await Promise.all(
        Array.from(
          { length: Math.max(pageCount - 1, 0) },
          (_, index) =>
            firstValueFrom(
              productService.getProducts(index + 2, 24)
            )
        )
      );

      return [firstPage, ...remainingPages]
        .flatMap((page) => page.results)
        .map((product) => ({ slug: product.slug }));
    },
  },

  {
    path: 'projects/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const projectService = inject(ProjectService);

      const projects = await firstValueFrom(
        projectService.getProjects()
      );

      return projects.map((project) => ({
        slug: project.slug,
      }));
    },
  },

  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];