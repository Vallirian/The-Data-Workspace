import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { NotificationInterface } from '../../interfaces/main-interface';
import { CommonModule } from '@angular/common';

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
  notificationService = inject(NotificationService);
  @Input() dismissalTime = 5000;
  @Output() notificationDismissed = new EventEmitter<NotificationInterface>();

  private intervals: Map<string, any> = new Map();

  ngOnInit() {}

  ngOnDestroy() {
    this.intervals.forEach(clearInterval);
  }

  dismissNotification(notification: NotificationInterface) {
    this.notificationService.dismissNotification(notification);
  }
}
