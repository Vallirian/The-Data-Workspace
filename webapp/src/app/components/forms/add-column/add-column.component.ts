import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { ColumnInterface } from '../../../interfaces/main-interface';

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

  isRelationship: boolean = false;
  columnForm = this.formBuilder.group({
    displayName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    dataType: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  onClose() {
    this.closeForm.emit();
  }

  onSave() {
    if (this.tableId === undefined) {
      this.notificationService.addNotification({message: 'Table ID not provided', type: 'error', dismissed: false, remainingTime: 5000});
      return
    }

    if (!this.columnForm.valid) {
      this.notificationService.addNotification({message: 'Invalid form data', type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }
    
    const columnFormValue = {
      displayName: this.columnForm.get('displayName')!.value!,
      description: this.columnForm.get('description')!.value!,
      dataType: this.columnForm.get('dataType')!.value! as 'string' | 'number' | 'boolean' | 'datetime'
    }
    this.apiService.createColumn(this.tableId, columnFormValue).subscribe({
      next: (columnData: any) => {
        this.notificationService.addNotification({message: 'Column created successfully', type: 'success', dismissed: false, remainingTime: 5000});
        this.columnForm.reset();
        this.columnCreated.emit(columnData);
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to create column', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }
}
