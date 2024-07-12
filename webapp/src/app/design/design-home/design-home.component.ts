import { Component } from '@angular/core';
import { UtilServiceService } from '../../services/util-service.service';

@Component({
  selector: 'app-design-home',
  standalone: true,
  imports: [],
  templateUrl: './design-home.component.html',
  styleUrl: './design-home.component.scss'
})
export class DesignHomeComponent {
  greeing: string = 'Hello'
  constructor(
    private utilService: UtilServiceService
  ) {
    this.greeing = utilService.getGreeting();
  }

  get userName() {
    return 'John Doe';
  }
}
