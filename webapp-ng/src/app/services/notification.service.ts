import { Injectable } from '@angular/core';
import { NotificationInterface } from '../interfaces/main';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notification$ = new Subject<NotificationInterface>();

  constructor() { }

  addNotification(notification: NotificationInterface) {
      this.notification$.next(notification);
  }

  getNotification(): Observable<NotificationInterface> {
      return this.notification$.asObservable();
  }
}
