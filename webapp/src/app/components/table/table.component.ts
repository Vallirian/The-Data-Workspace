import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { ColumnInterface } from '../../interfaces/main-interface';
import { UtilService } from '../../services/util.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ValidateService } from '../../services/validate.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() tableId: string = '';
  @Input() hasSearch: boolean = false;
  @Input() hasPagination: boolean = false;
  @Input() hasSort: boolean = false;
  @Input() hasFilter: boolean = false;
  @Input() hasExport: boolean = false;

  tableName: string = '';

  columns: ColumnInterface[] = [];
  rowData: any[] = [];

  changes = {
    added: [] as any[],
    updated: [] as any[],
    deleted: [] as any[]
  };
  newRowForms = this.formBuilder.group({
    rows: this.formBuilder.array([])
  });

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private utilService: UtilService,
    private validatorService: ValidateService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.tableName = this.utilService.changeUuidToTableName(this.tableId);
    this.apiService.getRawTable(this.tableId).subscribe({
      next: (tableData: any) => {
        this.rowData = tableData;
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load table data', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });

    this.apiService.listColumns(this.tableId).subscribe({
      next: (columns: ColumnInterface[]) => {
        this.columns = columns;
        // change column uuid to column name
        this.columns = this.columns.map((column) => {
          column.id = this.utilService.changeUuidToColumnName(column.id);
          return column;
        });
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load columns', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  get rows() {
    return (this.newRowForms.get('rows') as FormArray).controls;
  }
  
}
