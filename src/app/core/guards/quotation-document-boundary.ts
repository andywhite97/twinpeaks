import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { TrackingPrivacyService } from '../services/tracking-privacy.service';

export const quotationDocumentBoundary: CanActivateFn = (_route, state) =>
  inject(TrackingPrivacyService).allowNavigation(state.url);
