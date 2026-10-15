import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ApiService } from './api';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses the development API endpoint in unit tests', () => {
    expect(environment.production).toBeFalse();
    expect(service.url('contact/')).toBe('http://127.0.0.1:8000/api/contact/');
  });
});
