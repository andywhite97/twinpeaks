import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HomepageService } from './homepage';

describe('Homepage environment safety', () => {
  it('uses the local API under the development/test replacement', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    TestBed.inject(HomepageService).getHomepageData().subscribe();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('http://127.0.0.1:8000/api/homepage/').flush({});
    http.verify();
  });
});
