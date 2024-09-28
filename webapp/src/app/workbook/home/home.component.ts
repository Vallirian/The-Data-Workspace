import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { WorkbookInterface, DataTableMetaInterface, DataTableColumnMetaInterface } from '../../interfaces/main';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { DatetimePipe } from '../../pipes/datetime.pipe';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DatetimePipe, RouterOutlet],
  providers: [
    DatePipe // Required for DatetimePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  workbooks: WorkbookInterface[] = [];

  constructor(
    private notificationService: NotificationService,
    private apiService: ApiService,
    private router: Router
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

  onCreateWorkbook() {
    this.apiService.createWorkbook().subscribe(
      (data: WorkbookInterface) => {
        this.workbooks.push(data);
      },
      (error) => {
        this.notificationService.addNotification({
          type: 'error',
          message: error.message.error || 'Failed to create workbook',
          dismissed: false,
          remainingTime: 5000
        });
      }
    );
  }

  navigateToEditWorkbook(index: number) {
    this.router.navigate([`/workbook/${this.workbooks[index].id}`]);
  }

  getWorkbookTableMeta(index: number): DataTableMetaInterface {
    return this.workbooks[index].DataTableMeta;
  }
}
