import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { ColumnInterface } from '../../interfaces/main-interface';
import { UtilService } from '../../services/util.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ValidateService } from '../../services/validate.service';
import { NumberOnlyDirective } from '../../directives/number-only.directive';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NumberOnlyDirective
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
    added: [] as {[key: string]: {[key: string]: string | number |  boolean | Date | null}}[],
    updated: [] as any[],
    deleted: [] as any[]
  };
  rows = this.formBuilder.group({});

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private utilService: UtilService,
    private validatorService: ValidateService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.tableName = this.utilService.changeUuidToTableName(this.tableId);
    this.fetchColumnsAndData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableId'] && !changes['tableId'].firstChange) {
      this.tableName = this.utilService.changeUuidToTableName(this.tableId);
      this.fetchColumnsAndData();
    }
  }

  fetchColumnsAndData(): void {
    this.apiService.listColumns(this.tableId).subscribe({
      next: (columns: ColumnInterface[]) => {
        this.columns = columns.map(column => {
          column.id = this.utilService.changeUuidToColumnName(column.id);
          return column;
        });
        this.updateRawData();
      },
      error: (err) => {
        this.notificationService.addNotification({ message: 'Failed to load columns', type: 'error', dismissed: false, remainingTime: 5000 });
      }
    });
  }

  updateRawData(): void {
    this.apiService.getRawTable(this.tableId).subscribe({
      next: (tableData: any) => {
        this.rowData = tableData;
        this.createRowForm();
      },
      error: (err) => {
        this.notificationService.addNotification({ message: 'Failed to load table data', type: 'error', dismissed: false, remainingTime: 5000 });
      }
    });
  }

  createRowForm() {
    this.rows = this.formBuilder.group({});
    this.rowData.forEach((row) => {
      const tempForm = this.formBuilder.group({});
      this.columns.forEach((column) => {
        tempForm.addControl(column.id, this.formBuilder.group(
          {value: [row[column.id]], dataType: [column.dataType], isNew: [false], isEdited: [false]},
          {validators: this.validatorService.valueDataTypeFormValidator()}
        ));
      });
      this.rows.addControl(this.utilService.generateUUID(), tempForm);
    });
  }

  onAddNewRow() {
    const tempForm = this.formBuilder.group({});
    this.columns.forEach((column) => {
      tempForm.addControl(column.id, this.formBuilder.group(
        {value: [''], dataType: [column.dataType], isNew: [true], isEdited: [true]},
        {validators: this.validatorService.valueDataTypeFormValidator()}
      ));
    });
    this.rows.addControl(this.utilService.generateUUID(), tempForm);
  }

  onSave() {
    // collect changes
    for (const rowId of this.controlKeys()) {
      const row = this.getRow(rowId);
      const rowChanges: {[key: string]: {[key: string]: string | number |  boolean | Date | null}} = {[rowId]: {}};
      
      if (row.dirty || row.dirty) {
        let isRowNew = false;
        for (const columnId of Object.keys(row.controls)) {
          const column = this.getColumn(rowId, columnId);
          if (column.dirty) {
            rowChanges[rowId][columnId] = column.get('value')?.value;
          }
          if (column.get('isNew')?.value) {
            isRowNew = true;
          }
        }

        if (isRowNew) {
          this.changes.added.push(rowChanges);
        } else {
          this.changes.updated.push(rowChanges);
        }
      }
    }

    // save changes
    this.apiService.updateRawTable(this.tableId, this.changes).subscribe({
      next: (res) => {
        this.notificationService.addNotification({message: 'Table data saved', type: 'success', dismissed: false, remainingTime: 5000});
        this.updateRawData();
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to save table data', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  // getters
  controlKeys(): string[] {
    return Object.keys(this.rows.controls);
  }

  getRow(rowId: string): FormGroup {
    if (!this.rows.get(rowId)) {
      return this.formBuilder.group({});
    }
    return this.rows.get(rowId) as FormGroup;
  }

  getColumn(rowId: string, columnId: string): FormGroup {
    if (!this.rows.get(rowId)) {
      return this.formBuilder.group({});
    }
    if (!(this.rows.get(rowId) as FormGroup).get(columnId)) {
      return this.formBuilder.group({});
    }
    return (this.rows.get(rowId) as FormGroup).get(columnId) as FormGroup;
  }

  getCellType(rowId: string, columnId: string): string {
    return this.getColumn(rowId, columnId).get('dataType')?.value;
  }

  getCellValue(rowId: string, columnId: string): string | number |  boolean | Date | null {
    // console.log(this.getColumn(rowId, columnId).get('value')?.value);
    return this.getColumn(rowId, columnId).get('value')?.value;
  }

  cellIsEdited(rowId: string, columnId: string): boolean {
    return this.getColumn(rowId, columnId).get('isEdited')?.value;
  }

  // formatters
  formatDate(value: any): string {
    if (value && (typeof value === 'string' || value instanceof Date)) {
      return new Date(value).toLocaleString();
    }
    return '';
  }
}
