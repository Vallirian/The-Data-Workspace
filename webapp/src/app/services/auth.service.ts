import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { UserInterface } from '../interfaces/main';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: UserInterface | null = null;
  googleAuthProvider = new GoogleAuthProvider;

  constructor(
    private firebaseAuth: Auth  
  ) { }

  loginWithGoogle() {
    console.log('loginWithGoogle-authservice');
    signInWithPopup(this.firebaseAuth, this.googleAuthProvider)
      .then((result) => {
        this.user = result.user
      })
      .catch((error) => {
        console.error(error);
      })
  }

  logout() {
    this.firebaseAuth.signOut()
      .then(() => {
        this.user = null;
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
