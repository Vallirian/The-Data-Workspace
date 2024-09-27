import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { UserInterface } from '../interfaces/main';
import { NotificationService } from './notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: UserInterface | null = null;
  googleAuthProvider = new GoogleAuthProvider;

  constructor(
    private firebaseAuth: Auth,
    private notificationService: NotificationService,
    private http: HttpClient
  ) { }

  loginWithGoogle() {
    signInWithPopup(this.firebaseAuth, this.googleAuthProvider)
      .then(async (result) => {
        this.user = result.user
        const token = await result.user.getIdToken();
      })
      .catch((error) => {
        this.notificationService.addNotification({
          message: error.message,
          type: 'error',
          remainingTime: 5000,
          dismissed: false
        });
      })
  }

  logout() {
    this.firebaseAuth.signOut()
      .then(() => {
        this.user = null;
      })
      .catch((error) => {
        this.notificationService.addNotification({
          message: error.message,
          type: 'error',
          remainingTime: 5000,
          dismissed: false
        });
      });
  }
}
