import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { routes } from '../../app.routes';
import { TrackingPrivacyService } from '../services/tracking-privacy.service';
import { quotationDocumentBoundary } from './quotation-document-boundary';

describe('Quotation document route boundary', () => {
  it('guards every rendered route and cancels SPA navigation across the privacy boundary', () => {
    const privacy = jasmine.createSpyObj<TrackingPrivacyService>('privacy', ['allowNavigation']);
    privacy.allowNavigation.and.returnValue(false);
    TestBed.configureTestingModule({ providers: [{ provide: TrackingPrivacyService, useValue: privacy }] });
    for (const route of routes.filter(route => route.redirectTo === undefined)) {
      expect(route.canActivate).toContain(quotationDocumentBoundary);
    }
    const result = TestBed.runInInjectionContext(() => quotationDocumentBoundary({} as ActivatedRouteSnapshot,
      { url: '/quotations/existing-token' } as RouterStateSnapshot));
    expect(result).toBeFalse();
    expect(privacy.allowNavigation).toHaveBeenCalledOnceWith('/quotations/existing-token');
  });
});
