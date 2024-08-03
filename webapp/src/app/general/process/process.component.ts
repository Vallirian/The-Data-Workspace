import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProcessInterface } from '../../interfaces/main-interface';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss'
})
export class ProcessComponent {
  processList: ProcessInterface[] = [];
  tablesList: string[] = [];
  newProcessName: string = '';
  selectedProcess: string = '';

  processTableForm = this.formBuilder.group({
    tableNames: this.formBuilder.array([]),
  });

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.apiService.listProcesses().subscribe({
      next: (processes: ProcessInterface[]) => {
        this.processList = processes;
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load processes', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });

    this.apiService.listTables().subscribe({
      next: (tables: string[]) => {
        console.log(tables);
        this.tablesList = tables;
      },
      error: (err) => {
        this.notificationService.addNotification({message: err, type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onCreateProcess() {
    if (!this.newProcessName || this.newProcessName.trim() === '') {
      this.notificationService.addNotification({message: 'Process name cannot be empty', type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }

    this.apiService.createProcess(this.newProcessName).subscribe({
      next: (newProcess: string) => {
        // placehold before we get the actual data on the next GET request
        this.processList.push({id: newProcess, processName: this.newProcessName, createdAt: new Date()});
      },
      error: (err) => {
        this.notificationService.addNotification({message: err, type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onAddTable() {
    this.tableNames.push(this.formBuilder.control(''));
  }

  onUpdateProcess() {
    if (!this.selectedProcess) {
      this.notificationService.addNotification({message: 'Please select a process', type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }
  }

  // getters
  get tableNames() {
    return this.processTableForm.get('tableNames') as FormArray;
  }
}
