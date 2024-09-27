import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { WorkbookInterface } from '../../interfaces/main';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  workbooks: WorkbookInterface[] = [];
  items: number[] = [1,1, 1, 1, 1, 1, 11];

  constructor(
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

  }
}
