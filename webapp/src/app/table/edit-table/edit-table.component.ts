import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableComponent } from '../../components/table/table.component';
import { ApiService } from '../../services/api.service';
import { NavbarService } from '../../services/navbar.service';
import { NotificationService } from '../../services/notification.service';



@Component({
  selector: 'app-edit-table',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent
  ],
  templateUrl: './edit-table.component.html',
  styleUrl: './edit-table.component.scss'
})
export class EditTableComponent {
  selectedSection: 'section-details' | 'section-columns' | 'section-automations' = 'section-details';
  tableId: string = '';
  tableData: any = {};

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private navbarService: NavbarService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // set navbar actions
    this.navbarService.buttons.set([{label: 'Save', action: () => this.onSave()}]);

    this.tableId = this.activatedRoute.snapshot.params['id'];
    this.apiService.getTable(this.tableId).subscribe({
      next: (tableData: any) => {
        this.tableData = tableData;

        this.apiService.getRawTable(this.tableId).subscribe({
          next: (tableData: any) => {
            console.log('Table Data', tableData);
          },
          error: (err) => {
            this.notificationService.addNotification({message: 'Failed to load table', type: 'error', dismissed: false, remainingTime: 5000});
          }
        });
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load table', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onSave() {
    console.log('Save action');
  }
}
