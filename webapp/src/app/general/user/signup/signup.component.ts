import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  page: string = 'login';

  constructor(
    private authService: AuthService
  ) {
  }

  togglePage(event: Event) {
    event.preventDefault();
    this.page = this.page === 'login' ? 'signup' : 'login';
  }

  loginWithGoogle(event: Event) {
    event.preventDefault();
    this.authService.loginWithGoogle();
  }
}
