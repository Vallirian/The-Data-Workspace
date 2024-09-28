import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportDataHomeComponent } from '../../import-data/import-data-home/import-data-home.component';
import { WorkbookInterface } from '../../interfaces/main';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-edit-workbook',
  standalone: true,
  imports: [CommonModule, ImportDataHomeComponent],
  templateUrl: './edit-workbook.component.html',
  styleUrl: './edit-workbook.component.scss'
})
export class EditWorkbookComponent {
  workbookId: string = '';
  workbook: WorkbookInterface | null = null;
  importType: 'csv' | null = null;
  importModalOpen: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.workbookId = this.activatedRoute.snapshot.params['id'];

    // Fetch workbook data
    this.apiService.getWorkbook(this.workbookId).subscribe(
      (data: WorkbookInterface) => {
        this.workbook = data;
      },
      (error) => {
        this.notificationService.addNotification({
          message: error.error.error || 'Failed to fetch workbook data',
          type: 'error',
          dismissed: false,
          remainingTime: 5000
        });
      })
  }

  toggleImportData(importType: 'csv' | null): void {
    if (this.workbook === null) {
      return;
    }

    this.importType = importType;
    this.importModalOpen = importType ? true : false;
  }

    // Handle clicking outside of modal content (backdrop click)
    handleBackdropClick(event: MouseEvent): void {
      if (event.target === event.currentTarget) {
        this.toggleImportData(null);
      }
    }
}
