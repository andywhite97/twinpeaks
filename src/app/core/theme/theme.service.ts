import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { afterNextRender, DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
export const THEME_KEY = 'twinpeaks-theme';
export function resolveTheme(saved: string | null, systemDark: boolean): Theme {
  return saved === 'light' || saved === 'dark' ? saved : systemDark ? 'dark' : 'light';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private manual = false;
  private media?: MediaQueryList;
  readonly theme = signal<Theme>('light');

  constructor() { afterNextRender(() => this.initialize()); }

  private initialize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const window = this.document.defaultView;
    if (!window) return;
    this.media = window.matchMedia?.('(prefers-color-scheme: dark)');
    let saved: string | null = null;
    try { saved = window.localStorage.getItem(THEME_KEY); } catch { /* Storage can be blocked. */ }
    this.manual = saved === 'light' || saved === 'dark';
    this.apply(resolveTheme(saved, this.media?.matches ?? false));
    const onChange = (event: MediaQueryListEvent) => { if (!this.manual) this.apply(event.matches ? 'dark' : 'light'); };
    this.media?.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => this.media?.removeEventListener('change', onChange));
  }

  toggle(): void {
    this.manual = true;
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
    try { this.document.defaultView?.localStorage.setItem(THEME_KEY, this.theme()); } catch { /* In-memory choice still works. */ }
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;
  }
}
