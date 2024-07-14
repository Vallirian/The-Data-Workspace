import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UtilService } from '../../services/util.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-design-home',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './design-home.component.html',
  styleUrl: './design-home.component.scss'
})
export class DesignHomeComponent {
  greeing: string = 'Hello'
  constructor(
    private utilService: UtilService,
    private authService: AuthService
  ) {
    this.greeing = utilService.getGreeting();
  }

  get userName() {
    return String(this.authService.currentUser()?.username);
  }
}
