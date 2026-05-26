import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { GalleryList } from './gallery-list';
import { GalleryService } from '../gallery';

describe('GalleryList', () => {
  let component: GalleryList;
  let fixture: ComponentFixture<GalleryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryList],
      providers: [
        provideRouter([]),
        {
          provide: GalleryService,
          useValue: {
            getGalleryItems: () => of({ count: 0, next: null, previous: null, results: [] }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
