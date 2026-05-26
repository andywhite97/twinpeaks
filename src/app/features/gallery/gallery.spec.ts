import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { GalleryService } from './gallery';

describe('GalleryService', () => {
  let service: GalleryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(GalleryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
