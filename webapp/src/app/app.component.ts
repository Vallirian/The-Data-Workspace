import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './general/navbar/navbar.component';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './general/user/signup/signup.component';
import { NotificationComponent } from './general/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, SignupComponent, NotificationComponent,
    RouterLink
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'Processly';

  constructor(
    private firebaseAuth: Auth,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        this.authService.user = user;
        this.router.navigate(['/workbooks']);
      } else {
        this.router.navigate(['/login-or-signup']);
      }
    });
  }

  getUser() {
    return this.authService.user;
  }
}
