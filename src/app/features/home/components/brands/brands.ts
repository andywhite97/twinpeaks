import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { HomepageBrand } from '../../../../shared/models/homepage.model';

interface SwiperInstance { destroy(deleteInstance?: boolean, cleanStyles?: boolean): void; }
interface SwiperConstructor { new (element: HTMLElement, options: Record<string, unknown>): SwiperInstance; }
declare global { interface Window { Swiper?: SwiperConstructor; } }

@Component({ standalone: true, selector: 'app-brands-section', imports: [], templateUrl: './brands.html', styleUrl: './brands.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class BrandsComponent implements AfterViewChecked, OnDestroy {
  private brandItems: HomepageBrand[] = [];
  private swiper?: SwiperInstance;
  private initialiseTimer?: number;
  @ViewChild('swiperRoot') private swiperRoot?: ElementRef<HTMLElement>;
  @ViewChild('previousButton') private previousButton?: ElementRef<HTMLElement>;
  @ViewChild('nextButton') private nextButton?: ElementRef<HTMLElement>;
  @ViewChild('pagination') private pagination?: ElementRef<HTMLElement>;

  @Input() set brands(value: HomepageBrand[] | null | undefined) { this.brandItems = value ?? []; this.queueInitialisation(); }
  get brands(): HomepageBrand[] { return this.brandItems; }

  ngAfterViewChecked(): void { this.queueInitialisation(); }
  ngOnDestroy(): void { this.destroySwiper(); }

  fallbackLogo(name: string): string { return `https://placehold.co/180x90?text=${encodeURIComponent(name)}`; }
  useFallbackLogo(event: Event, name: string): void { const image = event.target as HTMLImageElement; image.onerror = null; image.src = this.fallbackLogo(name); }

  private queueInitialisation(): void {
    if (this.initialiseTimer || !this.swiperRoot || this.brands.length < 2) return;
    this.initialiseTimer = window.setTimeout(() => {
      this.initialiseTimer = undefined;
      this.destroySwiper();
      if (!this.swiperRoot || !window.Swiper) return;
      this.swiper = new window.Swiper(this.swiperRoot.nativeElement, {
        slidesPerView: 2, spaceBetween: 16, loop: this.brands.length > 6,
        autoplay: { delay: 3500, disableOnInteraction: false },
        navigation: { prevEl: this.previousButton?.nativeElement, nextEl: this.nextButton?.nativeElement },
        pagination: { el: this.pagination?.nativeElement, clickable: true },
        breakpoints: { 576: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 992: { slidesPerView: 5 }, 1200: { slidesPerView: 6 } },
      });
    });
  }

  private destroySwiper(): void { if (this.initialiseTimer) window.clearTimeout(this.initialiseTimer); this.initialiseTimer = undefined; this.swiper?.destroy(true, true); this.swiper = undefined; }
}
