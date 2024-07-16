import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NotificationInterface } from '../interfaces/main-interface';

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
