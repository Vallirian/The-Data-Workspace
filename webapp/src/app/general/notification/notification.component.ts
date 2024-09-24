import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NotificationInterface } from '../../interfaces/main';
import { NotificationService } from '../../services/notification.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  notification?: NotificationInterface;
  timeoutId?: number;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private notificationService: NotificationService
  ) { }


  ngOnInit(): void {
    this.notificationService.getNotification().subscribe({
      next: (notification: NotificationInterface) => {
        this.notification = notification;
        this.resetTimeout();
      }
    });
  }

  resetTimeout() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.timeoutId) {
        window.clearTimeout(this.timeoutId);
      }
      this.timeoutId = window.setTimeout(() => {
        this.notification = undefined;
      }, this.notification?.remainingTime);
    }
  }
}
