import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './general/navbar/navbar.component';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './general/user/signup/signup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, SignupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'Processly';

  constructor(
    private firebaseAuth: Auth,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        this.authService.user = user;
      } else {
        console.log('User is signed out');
      }
    });
  }

  getUser() {
    return this.authService.user;
  }
}
