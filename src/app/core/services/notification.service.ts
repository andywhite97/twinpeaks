import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<Notification[]>([]);
  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  success(message: string, duration = 4500): number { return this.show(message, 'success', duration); }
  error(message: string, duration = 6000): number { return this.show(message, 'error', duration); }
  info(message: string, duration = 4500): number { return this.show(message, 'info', duration); }

  show(message: string, type: NotificationType = 'info', duration = 4500): number {
    const id = ++this.nextId;
    this.notifications.update((items) => [...items, { id, message, type }]);

    if (isPlatformBrowser(this.platformId) && duration > 0) {
      this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
    }
    return id;
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.notifications.update((items) => items.filter((item) => item.id !== id));
  }
}
