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
    columnName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    dataType: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
  });

  relationshipColumnForm = this.formBuilder.group({
    rightTable: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    rightTableColumn: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
  });
  tablesList: string[] = [];
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

    this.isRelationship = true;
    if (this.tablesList.length === 0) {
      this.apiService.listTables().subscribe({
        next: (tables: string[]) => {
          this.tablesList = tables;
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to fetch tables', type: 'error', dismissed: false, remainingTime: 5000});
        }
      });
    }  
  }

  onSelectRightTable() {
    this.selectedRightTable = this.relationshipColumnForm.get('rightTable')!.value!;
    this.apiService.listColumns(this.selectedRightTable).subscribe({
      next: (columns: ColumnInterface[]) => {
        console.log(columns);
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
    console.log(this.columnForm.value);
    console.log(this.relationshipColumnForm.value);
    if (this.tableId === undefined) {
      this.notificationService.addNotification({message: 'Table not provided', type: 'error', dismissed: false, remainingTime: 5000});
      return
    }

    if(!this.isRelationship) {
      if (!this.columnForm.valid) {
        this.notificationService.addNotification({message: 'Invalid form data', type: 'error', dismissed: false, remainingTime: 5000});
        return;
      }
      
      const columnFormValue = {
        columnName: this.columnForm.get('columnName')!.value!,
        dataType: this.columnForm.get('dataType')!.value! as 'string' | 'number' | 'boolean' | 'datetime',
        isRelationship: false,
        relatedTable: null,
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
      this.apiService.createColumn(this.tableId, {
        columnName: this.relationshipColumnForm.get('rightTableColumn')!.value!,
        dataType: 'string',
        isRelationship: true,
        relatedTable: this.relationshipColumnForm.get('rightTable')!.value!,
      }).subscribe({
        next: (columnData: any) => {
          this.notificationService.addNotification({message: 'Column created successfully', type: 'success', dismissed: false, remainingTime: 5000});
          this.relationshipColumnCreated.emit(columnData);
          this.onClose();
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to create column', type: 'error', dismissed: false, remainingTime: 5000});
        }
      });
    }
  }

  // getters
  get selectedRitghtTableColumnId() {
    return this.relationshipColumnForm.get('rightTableColumn')!.value!;
  }
}
