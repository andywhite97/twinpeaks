import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config.pages';

bootstrapApplication(App, appConfig).catch(() => {
  document.body.textContent = 'TwinPeaks could not load. Please refresh the page.';
});
