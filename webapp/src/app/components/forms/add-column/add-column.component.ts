import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { ColumnInterface, RelationshipColumnInterface, TableListInterface } from '../../../interfaces/main-interface';

@Component({
  selector: 'app-add-column',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-column.component.html',
  styleUrl: './add-column.component.scss'
})
export class AddColumnComponent {
  @Input() tableId: string | undefined;
  @Output() closeForm: EventEmitter<any> = new EventEmitter();
  @Output() columnCreated: EventEmitter<ColumnInterface> = new EventEmitter();
  @Output() relationshipColumnCreated: EventEmitter<RelationshipColumnInterface> = new EventEmitter();

  isRelationship: boolean = false;
  columnForm = this.formBuilder.group({
    displayName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    dataType: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
  });

  relationshipColumnForm = this.formBuilder.group({
    rightTable: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    rightTableColumn: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
  });
  tablesList: TableListInterface[] = [];
  selectedRightTable: string | null = null;
  columnsList: ColumnInterface[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  onToggleRelationship() {
    if (this.isRelationship) {
      this.isRelationship = false;
      return;
    }

    // this.isRelationship = true;
    // if (this.tablesList.length === 0) {
    //   this.apiService.listTables().subscribe({
    //     next: (tables: TableListInterface[]) => {
    //       this.tablesList = tables;
    //     },
    //     error: (err) => {
    //       this.notificationService.addNotification({message: 'Failed to fetch tables', type: 'error', dismissed: false, remainingTime: 5000});
    //     }
    //   });
    // }  
  }

  onSelectRightTable() {
    this.selectedRightTable = this.relationshipColumnForm.get('rightTable')!.value!;
    this.apiService.listColumnsByTable(this.selectedRightTable).subscribe({
      next: (columns: ColumnInterface[]) => {
        this.columnsList = columns;
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to fetch columns', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onClose() {
    this.columnForm.reset();
    this.relationshipColumnForm.reset();
    this.isRelationship = false;
    this.closeForm.emit();
  }

  onSave() {
    if (this.tableId === undefined) {
      this.notificationService.addNotification({message: 'Table ID not provided', type: 'error', dismissed: false, remainingTime: 5000});
      return
    }

    if(!this.isRelationship) {
      if (!this.columnForm.valid) {
        this.notificationService.addNotification({message: 'Invalid form data', type: 'error', dismissed: false, remainingTime: 5000});
        return;
      }
      
      const columnFormValue = {
        displayName: this.columnForm.get('displayName')!.value!,
        description: this.columnForm.get('description')!.value!,
        dataType: this.columnForm.get('dataType')!.value! as 'string' | 'number' | 'boolean' | 'datetime',
        table: this.tableId
      }
      this.apiService.createColumn(this.tableId, columnFormValue).subscribe({
        next: (columnData: any) => {
          this.notificationService.addNotification({message: 'Column created successfully', type: 'success', dismissed: false, remainingTime: 5000});
          this.columnCreated.emit(columnData);
          this.onClose();
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to create column', type: 'error', dismissed: false, remainingTime: 5000});
        }
      });
    }
    else {
      if (!this.relationshipColumnForm.valid) {
        this.notificationService.addNotification({message: 'Invalid form data', type: 'error', dismissed: false, remainingTime: 5000});
        return;
      }
      this.apiService.createRelationshipColumn(this.tableId, {rightTableColumn: this.selectedRitghtTableColumnId}).subscribe({
        next: (columnData: any) => {
          this.notificationService.addNotification({message: 'Relationship column created successfully', type: 'success', dismissed: false, remainingTime: 5000});
          this.relationshipColumnCreated.emit({
            rightTableId: this.selectedRightTable!,
            rightTableDisplayName: this.tablesList.find((table) => table.id === this.selectedRightTable)!.displayName,
            rightColumnId: this.selectedRitghtTableColumnId,
            rightColumnDisplayName: this.columnsList.find((column) => column.id === this.selectedRitghtTableColumnId)!.displayName,
            rightColumnDataType: this.columnsList.find((column) => column.id === this.selectedRitghtTableColumnId)!.dataType
          });
          this.onClose();
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to create relationship column', type: 'error', dismissed: false, remainingTime: 5000});
        }
      });
    }
  }

  // getters
  get selectedRitghtTableColumnId() {
    return this.relationshipColumnForm.get('rightTableColumn')!.value!;
  }
}
