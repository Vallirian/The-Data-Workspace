import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { ColumnInterface, RelationshipColumnAPIInterface } from '../../interfaces/main-interface';
import { UtilService } from '../../services/util.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidateService } from '../../services/validate.service';
import { NumberOnlyDirective } from '../../directives/number-only.directive';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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

  columns: ColumnInterface[] = [];
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
  selectEnabled: boolean = false;

  searchTerm: string = '';

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
        this.notificationService.addNotification({ message: err.error.error || 'Failed to load table data', type: 'error', dismissed: false, remainingTime: 5000 });
      }
    });
  }


  extractColumns() {
    this.allColumnIds = [];
    this.displayedColumnIds = [];
    Object.keys(this.rowData[0]).forEach((columnId) => {
      if (columnId !== 'id' && !columnId.includes('__id') && columnId !== 'updatedAt') {
        this.displayedColumnIds.push(columnId);
      }
      this.allColumnIds.push(columnId);
    });

    this.apiService.listColumns(this.tableId).subscribe({
      next: (columns: ColumnInterface[]) => {
        this.columns = columns;
        this.createRowForm();
      },
      error: (err) => {
        this.notificationService.addNotification({ message: err.error.error || 'Failed to load columns', type: 'error', dismissed: false, remainingTime: 5000 });
      }
    });
  }

  createRowForm() {
    this.rows = this.formBuilder.group({});
    this.rowData.forEach((row) => {
      const tempForm = this.formBuilder.group({});

      // add columns to form
      this.displayedColumnIds.forEach((columnId) => {
        tempForm.addControl(
          columnId, 
          this.formBuilder.group(
            {value: [row[columnId]], dataType: this.getColumnById(columnId).dataType, isEdited: [false]}
          )
        );
      });

      // add row meta to form
      tempForm.addControl(
        '__rowMeta', 
        this.formBuilder.group({
          isNew: [false],
          isDeleted: [false]
        })
      ); 

      this.rows.addControl(row.id, tempForm);
    });
    this.fetchRelatedTablesData();

    /**
     * {
     *  rowId: {
     *    columnId: {
     *      value: ''
     *      dataType: ''
     *      isNew: false
      *     isEdited: false
     *    },
     *    __rowMeta: {
     *      isNew: false
     *      isDeleted: false
     *    }
     * }
     */
  }

  fetchRelatedTablesData() {
    // construct relatedTables fro query as {tableId: [columnId]}
    let relatedTables: {[key: string]: string[]} = {};
    this.columns.forEach((column) => {

      if (this.columnIsRelationship(column.columnName)) {
        const rightTableId = column.relatedTable!
        if (!relatedTables[rightTableId]) {
          relatedTables[rightTableId] = [];
        }
        relatedTables[rightTableId].push(column.columnName);
      }
    });

    // fetch related tables data
    Object.keys(relatedTables).forEach((tableId) => {
      this.apiService.getRawTableLimitedColumns(tableId, relatedTables[tableId]).subscribe({
        next: (tableData: any) => {
          this.realtedTablesRowData[tableId] = tableData;
          
        },
        error: (err) => {
          this.notificationService.addNotification({ message: err.error.error || 'Failed to load related tables data', type: 'error', dismissed: false, remainingTime: 5000 });
        }
      });
    });
    
  }

  onSave() {
    console.log(this.rows.value);
    // collect changes
    for (const rowId of this.getRowsFormControls()) {
      const row = this.getRowForm(rowId);
      const rowChanges: {[key: string]: {[key: string]: string | number |  boolean | Date | null}} = {[rowId]: {}};
      // console.log('row', row);
      
      if (row.dirty || row.dirty) {
        // console.log('rowId', rowId);
        for (let columnId of Object.keys(row.controls)) {
          const column = this.getCellForm(rowId, columnId);

          // use realtedtablename_id as columnid for relationship columns
          if (this.columnIsRelationship(columnId)) {
            const rightTableId = this.getColumnById(columnId).relatedTable!;
            const relationshipRightTableName = `${rightTableId}__id`;
            columnId = relationshipRightTableName;
          }
          
          if (column.dirty) {
            rowChanges[rowId][columnId] = column.get('value')?.value;
          }
        }

        const rowMeta = row.get('__rowMeta')?.value;
        if (rowMeta.isNew) {
          this.changes.added.push(rowChanges);
        } else if (rowMeta.isDeleted) {
          this.changes.deleted.push(rowChanges);
        } else {
          this.changes.updated.push(rowChanges);
        }
      }
    }

    // save changes
    console.log('changes', this.changes);
    console.log(this.rows)
    this.apiService.updateRawTable(this.tableId, this.changes).subscribe({
      next: (res) => {
        this.notificationService.addNotification({message: 'Table data saved', type: 'success', dismissed: false, remainingTime: 5000});
        this.changes = {
          added: [] as {[key: string]: {[key: string]: string | number |  boolean | Date | null}}[],
          updated: [] as {[key: string]: {[key: string]: string | number |  boolean | Date | null}}[],
          deleted: [] as any[]
        };
        this.fetchRowData();
      },
      error: (err) => {
        this.notificationService.addNotification({message: err.error.error || 'Failed to save table data', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onDeleteRows() {
    // get a list of selected row ids
    const selectedRowIds = this.getRowsFormControls().filter((rowId) => this.getRowMetaForm(rowId).get('isDeleted')?.value);
    console.log('selectedRowIds', selectedRowIds);

    // delete rows
    this.changes.deleted = selectedRowIds;
    this.onSave();

    // reset
    this.selectEnabled = false;
  }

  onDeleteTable() {
    this.apiService.deleteTable(this.tableId).subscribe({
      next: (res) => {
        this.notificationService.addNotification({message: 'Table deleted', type: 'success', dismissed: false, remainingTime: 5000});
      },
      error: (err) => {
        this.notificationService.addNotification({message: err.error.error || 'Failed to delete table', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  // add new
  onAddNewRow() {
    const tempForm = this.formBuilder.group({});
    this.displayedColumnIds.forEach((columnId) => {
      tempForm.addControl(columnId, this.formBuilder.group(
        {value: [''], dataType: this.getColumnById(columnId).dataType, isNew: [true], isEdited: [true]}
      ));
    });

    // add row meta to form
    tempForm.addControl(
      '__rowMeta', 
      this.formBuilder.group({
        isNew: [true],
        isDeleted: [false]
      })
    );

    this.rows.addControl(this.utilService.generateCustomUUID(), tempForm);
  }

  // update exsiting
  onSelectCellForUpdate(rowId: string, colId: string) {
    console.log('rowId', rowId);
    console.log('colId', colId);
    this.setColumEditted(rowId, colId);
  }

  setColumEditted(rowId: string, colId: string) {
    this.getCellForm(rowId, colId).get('isEdited')?.setValue(true);
  }

  // getters
  getColumnNameFromRelationshipColumnName(columnId: string): string {
    return columnId.split('__')[1];
  }

  getRelationshipColumnData(columnName: string): any[] {
    /**
     * given a relationship column name, return the related table data
     * if column is not a relationship column, return an empty array
     */
    const [tableName, colName] = columnName.split('__');
    if (!tableName || !colName) {
      return [];
    }
    const column = this.columns.find(column => column.columnName === colName);
    if (!column) {
      return [];
    }
    const table = this.realtedTablesRowData[tableName];
    return table || [];
  }

  getColumnById(columnName: string | null): ColumnInterface {
    /**
     * given a column id, which is a column name, return the column object
     * if column is a relationship column (identified by `__` in the column name), accomodate for that
     */
    if (columnName === null) {
      return {} as ColumnInterface;
    }
    if (columnName.includes('__')) {
      const [tableId, columnId] = columnName.split('__');
      // user column.relatedTable because the this.column is filtered by this.tableId on fetch
      return this.columns.find(column => column.relatedTable === tableId && column.columnName === columnId) || {} as ColumnInterface;
    }
    return this.columns.find(column => column.tableName === this.tableId && column.columnName === columnName) || {} as ColumnInterface;
  }

  getRowsFormControls(): string[] {
    return Object.keys(this.rows.controls);
  }

  getRowForm(rowId: string): FormGroup {
    if (!this.rows.get(rowId)) {
      return this.formBuilder.group({});
    }
    return this.rows.get(rowId) as FormGroup;
  }

  getRowFormAsString(rowId: string): string {
    // get column values
    let columnValues: string = '';
    const row = this.getRowForm(rowId).value;
    Object.keys(row).forEach((columnId) => {
      if (columnId !== '__rowMeta') {
        columnValues += `${row[columnId].value} `;
      }
    })
    columnValues = columnValues.trim().toLowerCase();
    return columnValues;
  }

  getRowMetaForm(rowId: string): FormGroup {
    if (!this.rows.get(rowId)) {
      return this.formBuilder.group({});
    }
    return this.getRowForm(rowId).get('__rowMeta') as FormGroup;
  }

  getCountOfDeletedRows(): number {
    return this.getRowsFormControls().filter((rowId) => this.getRowMetaForm(rowId).get('isDeleted')?.value).length;
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

  getCell(rowId: string, columnId: string): any {
    return this.getCellForm(rowId, columnId).value;
  }

  cellIsEdited(rowId: string, columnId: string): boolean {
    return this.getCellForm(rowId, columnId).get('isEdited')?.value;
  }

  columnIsRelationship(columnId: string): boolean {
    return this.getColumnById(columnId).isRelationship;
  }

  // formatters
  formatDate(value: any): string {
    if (value && (typeof value === 'string' || value instanceof Date)) {
      return new Date(value).toLocaleString();
    }
    return '';
  }
}
