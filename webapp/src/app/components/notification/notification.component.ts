import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { NotificationInterface } from '../../interfaces/main-interface';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  notification?: NotificationInterface;
  timeoutId?: number;

  constructor(
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
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    this.timeoutId = window.setTimeout(() => {
      this.notification = undefined;
    }, this.notification?.remainingTime );
  }
}
