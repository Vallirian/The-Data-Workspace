import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableComponent } from '../../components/table/table.component';
import { ApiService } from '../../services/api.service';
import { NavbarService } from '../../services/navbar.service';
import { NotificationService } from '../../services/notification.service';
import { AddColumnComponent } from '../../components/forms/add-column/add-column.component';
import { ColumnInterface, RelationshipColumnAPIInterface, RelationshipColumnInterface } from '../../interfaces/main-interface';
import { WebsocketService } from '../../services/websocket.service';

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
  relationshipColumns: RelationshipColumnInterface[] = [];
  relationshipAPIColumns: RelationshipColumnAPIInterface[] = [];

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private navbarService: NavbarService,
    private notificationService: NotificationService,
    private websocketService: WebsocketService
  ) { }

  ngOnInit(): void {
    // start websocket connection
    this.websocketService.analysisChatSocket.subscribe();

    // set navbar actions
    this.tableId = this.activatedRoute.snapshot.params['id'];
    this.apiService.getTable(this.tableId).subscribe({
      next: (tableData: any) => {
        this.tableData = tableData;
        this.navbarService.addBreadCrumb({label: tableData.displayName, navigationLink: `/table/${this.tableId}`});
        
        // load columns
        this.apiService.listColumnsByTable(this.tableId).subscribe({
          next: (columns: ColumnInterface[]) => {
            this.columns = columns;
          },
          error: (err) => {
            this.notificationService.addNotification({message: 'Failed to load columns', type: 'error', dismissed: false, remainingTime: 5000});
          }
        });

        // load relationship columns
        this.apiService.listRelationhipColumnsByTable(this.tableId).subscribe({
          next: (relationshipColumns: RelationshipColumnAPIInterface[]) => {
            this.relationshipAPIColumns = relationshipColumns
            this.createRelationshipColumnsDisplayName();
          },
          error: (err) => {
            this.notificationService.addNotification({message: 'Failed to load relationship columns', type: 'error', dismissed: false, remainingTime: 5000});
          }
        });

      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load table', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  ngOnDestroy(): void {
    this.navbarService.removeBreadCrumb();
  }

  createRelationshipColumnsDisplayName() {
    this.relationshipAPIColumns.forEach((relationshipColumn) => {
      let tableDisplayName = '';
      let columnDisplayName = '';
      let columnDataType = '';
      this.apiService.getTable(relationshipColumn.rightTable).subscribe({
        next: (tableData: any) => {
          tableDisplayName = tableData.displayName;
          this.apiService.listColumnsByTable(relationshipColumn.rightTable).subscribe({
            next: (columns: ColumnInterface[]) => {
              columns.forEach((column) => {
                if (column.id === relationshipColumn.rightTableColumn) {
                  columnDisplayName = column.displayName;
                  columnDataType = column.dataType;
                }
              });
              this.relationshipColumns.push({
                rightTableId: relationshipColumn.rightTable,
                rightTableDisplayName: tableDisplayName,
                rightColumnId: relationshipColumn.rightTableColumn,
                rightColumnDisplayName: columnDisplayName,
                rightColumnDataType: columnDataType
              });
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
    });
  }

  onAddNewColumn() {
    this.addNewColumnFormOpen = true;
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

  // to be deleted
  onSendWebsocketMessage() {
    this.websocketService.analysisChatSocket.next('Hello from Angular');
  }
}
