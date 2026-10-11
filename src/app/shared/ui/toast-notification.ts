import { ChangeDetectionStrategy, Component, DestroyRef, inject, Injectable, signal } from '@angular/core';

interface Toast { id: number; message: string; error: boolean; }
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<Toast[]>([]);
  private nextId = 0;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();
  constructor() { inject(DestroyRef).onDestroy(() => this.timers.forEach(timer => clearTimeout(timer))); }
  show(message: string, error = false): void {
    const id = ++this.nextId;
    this.messages.update(items => [...items, { id, message, error }]);
    this.timers.set(id, setTimeout(() => this.dismiss(id), error ? 8000 : 5500));
  }
  dismiss(id: number): void { clearTimeout(this.timers.get(id)); this.timers.delete(id); this.messages.update(items => items.filter(item => item.id !== id)); }
}

@Component({ selector: 'app-toast-notification', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="toast-region" aria-label="Notifications">@for (message of toast.messages(); track message.id) { <div class="toast" [attr.role]="message.error ? 'alert' : 'status'"><p>{{ message.message }}</p><button type="button" aria-label="Dismiss notification" (click)="toast.dismiss(message.id)">×</button></div> }</div>`,
})
export class ToastNotification { readonly toast = inject(ToastService); }
