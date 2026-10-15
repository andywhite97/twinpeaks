import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('submits development login to the configured local API', () => {
    service.login('test@example.com', 'test-only').subscribe();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('http://127.0.0.1:8000/api/auth/login/').flush({});
    http.verify();
  });
});
