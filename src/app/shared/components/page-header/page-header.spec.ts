import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PageHeader } from './page-header';

describe('Page header resource privacy', () => {
  it('loads the same decorative image with explicit no-referrer policy', () => {
    TestBed.configureTestingModule({ imports: [PageHeader], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Your quotation');
    fixture.componentRef.setInput('backgroundImage', '/img/headers/contact.jpg');
    fixture.detectChanges();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.page-header__background');
    expect(image.getAttribute('src')).toBe('/img/headers/contact.jpg');
    expect(image.referrerPolicy).toBe('no-referrer');
    expect(fixture.nativeElement.querySelector('.bg-holder').style.backgroundImage).toBe('');
  });
});
