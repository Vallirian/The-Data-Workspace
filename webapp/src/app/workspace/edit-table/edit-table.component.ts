import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableComponent } from '../../components/table/table.component';
import { ApiService } from '../../services/api.service';
import { NavbarService } from '../../services/navbar.service';
import { NotificationService } from '../../services/notification.service';
import { AddColumnComponent } from '../../components/forms/add-column/add-column.component';
import { ColumnInterface, RelationshipColumnAPIInterface, RelationshipColumnInterface } from '../../interfaces/main-interface';
import { AnalysisChatComponent } from '../../components/copilot/analysis-chat/analysis-chat.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-edit-table',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    AddColumnComponent,
    AnalysisChatComponent
  ],
  templateUrl: './edit-table.component.html',
  styleUrl: './edit-table.component.scss'
})
export class EditTableComponent {
  selectedSection: 'section-details' | 'section-copilot-chat' = 'section-details';
  tableId: string = '';
  tableData: any = {};

  addNewColumnFormOpen: boolean = false;
  columns: ColumnInterface[] = [];
  relationshipColumns: RelationshipColumnInterface[] = [];
  relationshipAPIColumns: RelationshipColumnAPIInterface[] = [];

  columnSelectedForDelete: string = '';

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private navbarService: NavbarService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // set navbar actions
    this.tableId = this.activatedRoute.snapshot.params['id'];
    this.navbarService.addBreadCrumb({label: this.tableId, navigationLink: `/table/${this.tableId}`});

    this.apiService.listColumns(this.tableId).subscribe({
        next: (columns: ColumnInterface[]) => {
          this.columns = columns;
        },
        error: (err) => {
          this.notificationService.addNotification({message: err.error.error || 'Failed to load columns', type: 'error', dismissed: false, remainingTime: 5000});
        }
      });


  }

  ngOnDestroy(): void {
    this.navbarService.removeBreadCrumb();
  }

  onAddNewColumn() {
    this.addNewColumnFormOpen = true;
  }

  onDeleteColumn(columnName: string) {
    this.apiService.deleteColumn(this.tableId, columnName).subscribe({
      next: (res) => {
        this.columns = this.columns.filter(column => column.columnName !== columnName);
        this.notificationService.addNotification({message: 'Column deleted', type: 'success', dismissed: false, remainingTime: 5000});
      },
      error: (err) => {
        this.notificationService.addNotification({message: err.error.error || 'Failed to delete column', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onCloseAddNewColumnForm() {
    this.addNewColumnFormOpen = false;
  }

  onColumnCreated(columnData: ColumnInterface) {
    this.columns.push(columnData);
  }
  
  onRelationshipColumnCreated(relationshipColumnData: RelationshipColumnInterface) {
    this.relationshipColumns.push(relationshipColumnData);
  }
}
