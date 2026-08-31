import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-notifications',
  standalone: true,
  templateUrl: './toast-notifications.html',
  styleUrl: './toast-notifications.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastNotifications {
  constructor(readonly notifications: NotificationService) {}
}
