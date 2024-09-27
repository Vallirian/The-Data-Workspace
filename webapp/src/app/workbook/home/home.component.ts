import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { WorkbookInterface } from '../../interfaces/main';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  workbooks: WorkbookInterface[] = [];

  constructor(
    private notificationService: NotificationService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.apiService.getWorkbooksList().subscribe(
      (data: WorkbookInterface[]) => {
        this.workbooks = data;
      },
      (error) => {
        this.notificationService.addNotification({
          type: 'error',
          message: error.message.error || 'Failed to fetch workbooks list',
          dismissed: false,
          remainingTime: 5000
        });
      }
  );
  }
}
