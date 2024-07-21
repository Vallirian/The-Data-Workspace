import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableComponent } from '../../components/table/table.component';
import { ApiService } from '../../services/api.service';
import { NavbarService } from '../../services/navbar.service';
import { NotificationService } from '../../services/notification.service';
import { AddColumnComponent } from '../../components/forms/add-column/add-column.component';
import { ColumnInterface } from '../../interfaces/main-interface';

@Component({
  selector: 'app-edit-table',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    AddColumnComponent
  ],
  templateUrl: './edit-table.component.html',
  styleUrl: './edit-table.component.scss'
})
export class EditTableComponent {
  selectedSection: 'section-details' | 'section-columns' | 'section-automations' = 'section-details';
  tableId: string = '';
  tableData: any = {};

  addNewColumnFormOpen: boolean = false;
  columns: ColumnInterface[] = [];

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private navbarService: NavbarService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // set navbar actions
    this.tableId = this.activatedRoute.snapshot.params['id'];
    this.apiService.getTable(this.tableId).subscribe({
      next: (tableData: any) => {
        this.tableData = tableData;
        
        // load columns
        this.apiService.listColumns(this.tableId).subscribe({
          next: (columns: ColumnInterface[]) => {
            this.columns = columns;
          },
          error: (err) => {
            this.notificationService.addNotification({message: 'Failed to load columns', type: 'error', dismissed: false, remainingTime: 5000});
          }
        });

      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load table', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onAddNewColumn() {
    this.addNewColumnFormOpen = true;
  }

  onCloseAddNewColumnForm() {
    this.addNewColumnFormOpen = false;
    console.log('close form');
  }

  onColumnCreated(columnData: ColumnInterface) {
    this.columns.push(columnData);
  }
}
