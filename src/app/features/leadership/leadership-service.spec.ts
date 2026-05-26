import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { LeadershipService } from './leadership-service';

describe('LeadershipService', () => {
  let service: LeadershipService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(LeadershipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
