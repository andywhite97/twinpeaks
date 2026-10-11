import { ApplicationConfig, provideZonelessChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

// Pages supplies a browser shell rather than server-rendered HTML to hydrate.
export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()), provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled',
    }))],
};
