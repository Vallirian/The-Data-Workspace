import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UtilService } from '../../services/util.service';
import { Router, RouterLink } from '@angular/router';
import { NavbarService } from '../../services/navbar.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  initial: string = '';
  backgroundColor: string = '';

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private router: Router,
    private navbarService: NavbarService
  ) {}

  private colorPalette: string[] = [
    '#E7A9FE', // Bold pastel purple
    '#A7E3EB', // Bold pastel sky blue
    '#CCCCCC', // Bold pastel gray
    '#FFB280', // Bold pastel orange
    '#B6D7A8', // Bold pastel green
    '#EA9999'  // Bold pastel red
  ];

  ngOnInit(): void {
    this.initial = this.user?.username ? this.user?.username[0].toUpperCase() : 'P';
    this.backgroundColor = this.utilService.getPastelColor(this.user?.id || '') ||  this.getRandomColor(); // Set a random color from the palette
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRandomColor(): string {
    // Randomly pick a color from the predefined color palette
    return this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
  }

  get user() {
    return this.authService.currentUser();
  }

  get breadCrumb() {
    return this.navbarService.breadCrumb();
  }

  get documentationUrl() {
    return environment.documentationUrl;
  }
}
