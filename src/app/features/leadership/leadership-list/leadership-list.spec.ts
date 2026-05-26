import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { LeadershipList } from './leadership-list';
import { LeadershipService } from '../leadership-service';
import { CompanyProfileService } from '../../../core/services/company-profile';

describe('LeadershipList', () => {
  let component: LeadershipList;
  let fixture: ComponentFixture<LeadershipList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadershipList],
      providers: [
        provideRouter([]),
        {
          provide: LeadershipService,
          useValue: {
            getLeaders: () => of([]),
          },
        },
        {
          provide: CompanyProfileService,
          useValue: {
            getCompanyProfile: () => of(null),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadershipList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
