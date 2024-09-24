import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { UserInterface } from '../interfaces/main';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: UserInterface | null = null;
  googleAuthProvider = new GoogleAuthProvider;

  constructor(
    private firebaseAuth: Auth,
    private notificationService: NotificationService
  ) { }

  loginWithGoogle() {
    console.log('loginWithGoogle-authservice');
    signInWithPopup(this.firebaseAuth, this.googleAuthProvider)
      .then((result) => {
        this.user = result.user
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
    console.log('logout-authservice');
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
