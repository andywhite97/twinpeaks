import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { HomepageTestimonial } from '../../../../shared/models/homepage.model';

interface SwiperInstance { destroy(deleteInstance?: boolean, cleanStyles?: boolean): void; }
interface SwiperConstructor { new (element: HTMLElement, options: Record<string, unknown>): SwiperInstance; }
declare global { interface Window { Swiper?: SwiperConstructor; } }

@Component({ standalone: true, selector: 'app-testimonials-section', imports: [], templateUrl: './testimonials.html', styleUrl: './testimonials.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class TestimonialsComponent implements AfterViewChecked, OnDestroy {
  private testimonialItems: HomepageTestimonial[] = [];
  private swiper?: SwiperInstance;
  private initialiseTimer?: number;
  @ViewChild('swiperRoot') private swiperRoot?: ElementRef<HTMLElement>;
  @ViewChild('previousButton') private previousButton?: ElementRef<HTMLElement>;
  @ViewChild('nextButton') private nextButton?: ElementRef<HTMLElement>;
  @ViewChild('pagination') private pagination?: ElementRef<HTMLElement>;

  @Input() set testimonials(value: HomepageTestimonial[] | null | undefined) { this.testimonialItems = value ?? []; this.queueInitialisation(); }
  get testimonials(): HomepageTestimonial[] { return this.testimonialItems; }
  ngAfterViewChecked(): void { this.queueInitialisation(); }
  ngOnDestroy(): void { this.destroySwiper(); }
  stars(rating: number): string { return '★'.repeat(Math.max(0, Math.min(5, rating))); }

  private queueInitialisation(): void {
    if (this.initialiseTimer || !this.swiperRoot || this.testimonials.length < 2) return;
    this.initialiseTimer = window.setTimeout(() => {
      this.initialiseTimer = undefined;
      this.destroySwiper();
      if (!this.swiperRoot || !window.Swiper) return;
      this.swiper = new window.Swiper(this.swiperRoot.nativeElement, {
        slidesPerView: 1, spaceBetween: 16, loop: this.testimonials.length > 2,
        autoplay: { delay: 6000, disableOnInteraction: false },
        navigation: { prevEl: this.previousButton?.nativeElement, nextEl: this.nextButton?.nativeElement },
        pagination: { el: this.pagination?.nativeElement, clickable: true },
      });
    });
  }

  private destroySwiper(): void { if (this.initialiseTimer) window.clearTimeout(this.initialiseTimer); this.initialiseTimer = undefined; this.swiper?.destroy(true, true); this.swiper = undefined; }
}
