import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnChanges, output, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggle } from './theme-toggle';
import { Icon } from '../ui/icon';
import { navigation } from './navigation';

@Component({ selector: 'app-mobile-navigation', imports: [RouterLink, RouterLinkActive, ThemeToggle, Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<dialog #dialog class="mobile-dialog" id="mobile-navigation" aria-label="Mobile navigation" (cancel)="close($event)" (click)="onBackdrop($event)"><div class="mobile-panel"><div class="mobile-top"><span>Menu</span><button class="icon-button" type="button" aria-label="Close navigation" (click)="close()"><app-icon name="close" /></button></div><nav aria-label="Mobile primary navigation">@for (item of items; track item.path) { <a [routerLink]="item.path" routerLinkActive="active" ariaCurrentWhenActive="page" [routerLinkActiveOptions]="{ exact: item.path === '/' }" (click)="close()">{{ item.label }}<app-icon name="arrow" /></a> }<a class="button button-primary" routerLink="/request-quote" (click)="close()">Request a Quote <app-icon name="arrow" /></a></nav><div class="mobile-theme"><p>Make yourself comfortable.</p><app-theme-toggle /></div></div></dialog>`,
})
export class MobileNavigation implements OnChanges {
  @Input() open = false;
  @ViewChild('dialog', { static: true }) private dialog?: ElementRef<HTMLDialogElement>;
  readonly closed = output<void>(); readonly items = navigation;
  @HostListener('keydown', ['$event'])
  trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.dialog?.nativeElement.open) return;
    const controls = this.dialog.nativeElement.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    const first = controls.item(0); const last = controls.item(controls.length - 1);
    const active = this.dialog.nativeElement.ownerDocument.activeElement;
    if (event.shiftKey && active === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && active === last) { event.preventDefault(); first?.focus(); }
  }
  ngOnChanges(): void {
    if (!this.dialog) return;
    if (this.open && !this.dialog.nativeElement.open) this.dialog.nativeElement.showModal();
    if (!this.open && this.dialog.nativeElement.open) this.dialog.nativeElement.close();
  }
  close(event?: Event): void { event?.preventDefault(); this.dialog?.nativeElement.close(); this.closed.emit(); }
  onBackdrop(event: MouseEvent): void { if (event.target === this.dialog?.nativeElement) this.close(); }
}
