import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../core/theme/theme.service';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-full-screen-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<dialog #panel class="full-screen-loader" [style.--loader-background]="theme.theme() === 'dark' ? '#071524' : '#F4F8FC'" aria-labelledby="loader-title" tabindex="-1" (cancel)="$event.preventDefault()"><div class="loader-content" role="status" aria-live="polite">@if (!imageFailed()) { <img class="loader-animation" [src]="'/assets/loader/twinpeaks_loader_smooth_' + theme.theme() + '.gif'" alt="" width="420" height="420" (error)="imageFailed.set(true)" /> }<img class="loader-static" [class.loader-static--fallback]="imageFailed()" src="/assets/brand/icon_only.png" alt="" width="160" height="160" /><h2 id="loader-title">Loading…</h2><p>Please wait a moment.</p></div></dialog>`,
  styles: `
    .full-screen-loader { position:fixed; inset:0; width:100%; max-width:none; height:100%; height:100dvh; max-height:none; margin:0; padding:24px; border:0; background:var(--loader-background); color:var(--text); overflow:hidden; }
    .full-screen-loader[open] { display:grid; place-items:center; }
    .full-screen-loader::backdrop { background:var(--loader-background); }
    .loader-content { display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px; }
    .loader-animation { width:min(280px,65vw); height:auto; }
    .loader-static { display:none; width:min(160px,45vw); height:auto; margin:40px; }
    .loader-static--fallback { display:block; }
    h2 { font-size:1.15rem; letter-spacing:0; }
    p { color:var(--muted); font-size:.875rem; }
    @media (prefers-reduced-motion:reduce) { .loader-animation { display:none; } .loader-static { display:block; } }
  `,
})
export class FullScreenLoader implements AfterViewInit, OnDestroy {
  private readonly panel = viewChild.required<ElementRef<HTMLDialogElement>>('panel');
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private previousOverflow = '';
  readonly imageFailed = signal(false);
  readonly theme = inject(ThemeService);

  ngAfterViewInit(): void {
    if (!this.browser) return;
    this.previousOverflow = this.document.documentElement.style.overflow;
    this.document.documentElement.style.overflow = 'hidden';
    this.panel().nativeElement.showModal();
  }

  ngOnDestroy(): void {
    if (!this.browser) return;
    this.panel().nativeElement.close();
    this.document.documentElement.style.overflow = this.previousOverflow;
  }
}
