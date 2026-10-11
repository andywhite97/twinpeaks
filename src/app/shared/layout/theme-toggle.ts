import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';
import { Icon } from '../ui/icon';

@Component({ selector: 'app-theme-toggle', imports: [Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button type="button" class="theme-toggle" [attr.aria-label]="theme.theme() === 'light' ? 'Switch to dark theme' : 'Switch to light theme'" [attr.aria-pressed]="theme.theme() === 'dark'" (click)="theme.toggle()"><span class="sun-icon"><app-icon name="sun" /></span><span class="moon-icon"><app-icon name="moon" /></span><span class="theme-toggle-label">Theme</span></button>`,
})
export class ThemeToggle { readonly theme = inject(ThemeService); }
