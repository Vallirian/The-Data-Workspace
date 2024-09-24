import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  page: string = 'login';

  constructor() {
  }

  togglePage(event: Event) {
    event.preventDefault();
    this.page = this.page === 'login' ? 'signup' : 'login';
  }
}
