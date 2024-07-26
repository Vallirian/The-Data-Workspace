import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { ColumnInterface, RelationshipColumnAPIInterface } from '../../interfaces/main-interface';
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
  relationshipAPIColumns: RelationshipColumnAPIInterface[] = [];
  allColumnIds: string[] = [];
  displayedColumnIds: string[] = [];
  rowData: any[] = [];
  realtedTablesRowData: {[key: string]: any} = {};

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
    /**
     * flow
     * 1. fetch table data
     * 2. extract columns
     * 3. create row form
     * 4. fetch related tables' data
     * 
     * controls
     * - everything works off of rowData
     */
    this.fetchRowData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableId'] && !changes['tableId'].firstChange) {
      this.tableName = this.tableId;
      this.fetchRowData();
    }
  }

  fetchRowData() {
    this.apiService.getRawTable(this.tableId).subscribe({
      next: (tableData: any) => {
        this.rowData = tableData;
        this.extractColumns();
      },
      error: (err) => {
        this.notificationService.addNotification({ message: 'Failed to load table data', type: 'error', dismissed: false, remainingTime: 5000 });
      }
    });
  }


  extractColumns() {
    this.allColumnIds = [];
    this.displayedColumnIds = [];
    console.log(this.rowData);
    Object.keys(this.rowData[0]).forEach((columnId) => {
      if (columnId !== 'id' && !columnId.includes('_id') && columnId !== 'updatedAt') {
        this.displayedColumnIds.push(columnId);
      }
      this.allColumnIds.push(columnId);
    });

    this.apiService.listColumns(this.displayedColumnIds).subscribe({
      next: (columns: ColumnInterface[]) => {
        this.columns = columns;
        this.createRowForm();
      },
      error: (err) => {
        this.notificationService.addNotification({ message: 'Failed to load columns', type: 'error', dismissed: false, remainingTime: 5000 });
      }
    });
  }

  createRowForm() {
    this.rows = this.formBuilder.group({});
    this.rowData.forEach((row) => {
      const tempForm = this.formBuilder.group({});
      this.displayedColumnIds.forEach((columnId) => {
        tempForm.addControl(columnId, this.formBuilder.group(
          {value: [row[columnId]], dataType: this.getColumnById(columnId).dataType, isNew: [false], isEdited: [false]},
          {validators: this.validatorService.valueDataTypeFormValidator()}
        ));
      });
      this.rows.addControl(row.id, tempForm);
    });
    this.fetchRelatedTablesData();
  }

  fetchRelatedTablesData() {
    // construct relatedTables fro query as {tableId: [columnId]}
    let relatedTables: {[key: string]: string[]} = {};
    this.columns.forEach((column) => {
      if (this.columnIsRelationship(column.id) && this.displayedColumnIds.includes(column.id)) {
        const rightTableId = column.table;
        if (!relatedTables[rightTableId]) {
          relatedTables[rightTableId] = [];
        }
        relatedTables[rightTableId].push(column.id);
      }
    });

    // fetch related tables data
    Object.keys(relatedTables).forEach((tableId) => {
      this.apiService.getRawTableLimitedColumns(tableId, relatedTables[tableId]).subscribe({
        next: (tableData: any) => {
          this.realtedTablesRowData[tableId] = tableData;
        },
        error: (err) => {
          this.notificationService.addNotification({ message: 'Failed to load related tables data', type: 'error', dismissed: false, remainingTime: 5000 });
        }
      });
    });
    
  }



  onSave() {
    // collect changes
    for (const rowId of this.getRowsFormControls()) {
      const row = this.getRowForm(rowId);
      const rowChanges: {[key: string]: {[key: string]: string | number |  boolean | Date | null}} = {[rowId]: {}};
      
      if (row.dirty || row.dirty) {
        let isRowNew = false;
        for (let columnId of Object.keys(row.controls)) {
          const column = this.getCellForm(rowId, columnId);

          // use tablename_id as columnid for relationship columns
          if (this.columnIsRelationship(columnId)) {
            const rightTableId = this.getColumnById(columnId).table;
            const relationshipRightTableName = this.utilService.changeUuidToRelationshipRightTableName(rightTableId);
            columnId = relationshipRightTableName;
          }
          
          if (column.dirty) {
            rowChanges[rowId][columnId] = column.get('value')?.value;
          }
          if (column.get('isNew')?.value) {
            isRowNew = column.get('isNew')?.value;
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
        this.fetchRowData();
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to save table data', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onAddNewRow() {
    const tempForm = this.formBuilder.group({});
    this.displayedColumnIds.forEach((columnId) => {
      tempForm.addControl(columnId, this.formBuilder.group(
        {value: [''], dataType: this.getColumnById(columnId).dataType, isNew: [true], isEdited: [true]},
        {validators: this.validatorService.valueDataTypeFormValidator()}
      ));
    });
    this.rows.addControl(this.utilService.generateCustomUUID(), tempForm);
  }

  getRelationshipColumnData(columnId: string): any[] {
    const column = this.columns.find(column => column.id === columnId);
    if (!column) {
      return [];
    }
    const table = this.realtedTablesRowData[column.table]
    return table || [];
  }

  getColumnById(columnId: string): ColumnInterface {
    return this.columns.find(column => column.id === columnId) || {id: '', displayName: '', description: '', dataType: 'string', table: ''};
  }

  getRowsFormControls(): string[] {
    return Object.keys(this.rows.controls);
  }
  // controlKeys(): string[] {
  //   return Object.keys(this.rows.controls);
  // }

  getRowForm(rowId: string): FormGroup {
    if (!this.rows.get(rowId)) {
      return this.formBuilder.group({});
    }
    return this.rows.get(rowId) as FormGroup;
  }

  getCellForm(rowId: string, columnId: string): FormGroup {
    if (!this.rows.get(rowId)) {
      return this.formBuilder.group({});
    }
    if (!(this.rows.get(rowId) as FormGroup).get(columnId)) {
      return this.formBuilder.group({});
    }
    return (this.rows.get(rowId) as FormGroup).get(columnId) as FormGroup;
  }

  // getCellType(rowId: string, columnId: string): string {
  //   return this.getColumn(rowId, columnId).get('dataType')?.value;
  // }

  // getCellValue(rowId: string, columnId: string): string | number |  boolean | Date | null {
  //   return this.getColumn(rowId, columnId).get('value')?.value;
  // }

  getCell(rowId: string, columnId: string): any {
    return this.getCellForm(rowId, columnId).value;
  }

  cellIsEdited(rowId: string, columnId: string): boolean {
    return this.getCellForm(rowId, columnId).get('isEdited')?.value;
  }

  columnIsRelationship(columnId: string): boolean {
    return this.columns.some(column => column.table !== this.tableId && column.id === columnId);
  }

  // getRelationshipColumnTableId(columnId: string): string {
  //   const relationshipColumn = this.relationshipAPIColumns.find(relationshipColumn => relationshipColumn.rightTableColumn === columnId);
  //   return relationshipColumn?.rightTable || '';
  // }

  // getRelationshipColumnData(columnId: string): any[] {
  //   return this.realtedTablesRowData[this.getRelationshipColumnTableId(columnId)] || [];
  // }

  // formatters
  formatDate(value: any): string {
    if (value && (typeof value === 'string' || value instanceof Date)) {
      return new Date(value).toLocaleString();
    }
    return '';
  }
}
