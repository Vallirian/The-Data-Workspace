import { Injectable, signal } from '@angular/core';
import { NotificationInterface } from '../interfaces/main-interface';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications: NotificationInterface[] = [];
  notificationSignal = signal<NotificationInterface[]>([]);
  defaultRemainingTime = 5000;

  private intervals: Map<string, any> = new Map();

  constructor(
    private utilService: UtilService
  ) {}

  startCountdown(notification: NotificationInterface) {
    this.intervals.set(
      notification.id, 
      setInterval(() => {
        notification.remainingTime -= 1000;
        if (notification.remainingTime <= 0) {this.dismissNotification(notification);}
      }, 1000)
    );
  }

  addSuccessNotification(message: string) {
    this.addNotification(message, 'success');
  }

  addErrorNotification(message: string) {
    this.addNotification(message, 'error');
  }

  addInfoNotification(message: string) {
    this.addNotification(message, 'info');
  }

  private addNotification(message: string, type: 'success' | 'error' | 'info') {
    const newNotification: NotificationInterface = {
      id: this.utilService.generateUUID(),
      message: message,
      type: type,
      dismissed: false,
      remainingTime: this.defaultRemainingTime
    };
    this.notificationSignal.update((notifications) => {
      return [
        ...notifications,
        newNotification
      ];
    });
    this.startCountdown(newNotification);
  }

  dismissNotification(notification: NotificationInterface) {
    // clean up the interval
    clearInterval(this.intervals.get(notification.id));
    this.intervals.delete(notification.id);
    console.log('notification cleared', notification);

    // clean up the notification
    // this.notifications = this.notifications.filter(n => n.id !== notification.id);
    this.notificationSignal.update((notifications) => {
      console.log('notification signal updated', notifications);
      return notifications.filter(n => n.id !== notification.id);
    });

    setTimeout(() => {}, 400); // Adjust based on your CSS transition
  }
}
