import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Services } from './services';

describe('Services', () => {
  let service: Services;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(Services);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
