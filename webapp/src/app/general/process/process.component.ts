import { Component, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CopilotMessageInterface, ProcessInterface, ProcessTableRelationshipInterface } from '../../interfaces/main-interface';
import { AuthService } from '../../services/auth.service';

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
  processTableRelationships: ProcessTableRelationshipInterface[] = [];
  tablesList: string[] = [];
  newProcessName: string = '';
  newProcessDescription: string = '';
  selectedProcess: string = '';
  editProcessType: 'manual' | 'auto' = 'manual';

  currentMessage: string = '';
  currentResponse: string = '';
  answerLoading: boolean = false;
  chatId: string | null = null;

  processTableForm = this.formBuilder.group({
    tableNames: this.formBuilder.array([]),
  });

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.apiService.listProcesses().subscribe({
      next: (processes: ProcessInterface[]) => {
        this.processList = processes;
        console.log(processes);

        // get process table relationships
        processes.forEach((process: ProcessInterface) => {
          this.apiService.getPrcessTables(process.processName).subscribe({
            next: (processTables: ProcessTableRelationshipInterface[]) => {
              this.processTableRelationships.push(...processTables);
            },
            error: (err) => {
              this.notificationService.addNotification({message: 'Failed to load process tables', type: 'error', dismissed: false, remainingTime: 5000});
            }
          });
        });
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load processes', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });

    this.apiService.listTables().subscribe({
      next: (tables: string[]) => {
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

    if (!this.newProcessDescription || this.newProcessDescription.trim() === '') {
      this.notificationService.addNotification({message: 'Process description cannot be empty', type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }

    this.apiService.createProcess(this.newProcessName, this.newProcessDescription).subscribe({
      next: (newProcess: string) => {
        // placehold before we get the actual data on the next GET request
        this.processList.push({processName: this.newProcessName, createdAt: new Date(), processDescription: this.newProcessDescription});
        this.newProcessName = '';
        this.newProcessDescription = '';
        this.notificationService.addNotification({message: 'Process created successfully', type: 'success', dismissed: false, remainingTime: 5000});
      },
      error: (err) => {
        this.notificationService.addNotification({message: err, type: 'error', dismissed: false, remainingTime: 5000});
        this.newProcessName = '';
        this.newProcessDescription = '';
      }
    });
  }

  onSelectProcess(processName: string) {
    console.log('selected process', processName);
    // remove previous table names
    this.tableNames.clear();

    this.selectedProcess = processName;
    const processTables = this.processTableRelationships.filter((prcsTable: ProcessTableRelationshipInterface) => prcsTable.processName === processName);
    if (processTables.length > 0) {
      this.tableNames.clear();
      processTables.forEach((prcsTable: ProcessTableRelationshipInterface) => {
        this.tableNames.push(this.formBuilder.control(prcsTable.tableName));
      });
    }
  }

  onAddTable() {
    this.tableNames.push(this.formBuilder.control(''));
  }

  onUpdateProcess() {
    if (!this.selectedProcess) {
      this.notificationService.addNotification({message: 'Please select a process', type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }
  
    const tableNames: string[] = this.processTableForm.value.tableNames as string[];
    if (!tableNames || tableNames.length === 0) {
      this.notificationService.addNotification({message: 'Please add tables to the process', type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }
    
    // remove empty strings 
    const filteredTableNames = tableNames.filter((tableName: string) => tableName.trim() !== '');
    
    // remove duplicates
    const uniqueTableNames = Array.from(new Set(filteredTableNames));
    
    this.apiService.updateProcessTable(this.selectedProcess, uniqueTableNames).subscribe({
      next: (updatedProcess: string[]) => {
        this.notificationService.addNotification({message: 'Process updated successfully', type: 'success', dismissed: false, remainingTime: 5000});
      },
      error: (err) => {
        this.notificationService.addNotification({message: err, type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  onDeleteProcess(processName: string) {
    this.apiService.deleteProcess(processName).subscribe({
      next: (deletedProcess: string) => {
        this.processList = this.processList.filter((process: ProcessInterface) => process.processName !== processName);
        this.notificationService.addNotification({message: 'Process deleted successfully', type: 'success', dismissed: false, remainingTime: 5000});
      },
      error: (err) => {
        this.notificationService.addNotification({message: err, type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  // AI chat
  onSendMessage() {
    if (!this.currentMessage || this.currentMessage.trim() === '' || this.answerLoading) {
      return;
    }
    this.answerLoading = true;

    // add message to chat
    if (this.chatId === null) {
      this.apiService.startProcessChat(this.currentMessage, this.selectedProcess).subscribe({
        next: (newMessage: CopilotMessageInterface) => {
          this.chatId = newMessage.chatId;
          this.currentResponse = newMessage.message;
          this.currentMessage = '';
          this.answerLoading = false;
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to start conversation', type: 'error', dismissed: false, remainingTime: 5000});
          this.currentMessage = '';
          this.answerLoading = false
        }
      });
    }
    else {
      this.apiService.sendMessageProcessChat(this.chatId, this.currentMessage, this.selectedProcess).subscribe({
        next: (newMessage: CopilotMessageInterface) => {
          this.currentResponse = newMessage.message;
          this.currentMessage = '';
          this.answerLoading = false
        },
        error: (err) => {
          this.notificationService.addNotification({message: 'Failed to send message', type: 'error', dismissed: false, remainingTime: 5000});
          this.currentMessage = '';
          this.answerLoading = false
        }
      });
    }

  }

  // getters
  getNumberOfTablesForProcess(processName: string) {
    return this.processTableRelationships.filter((prcsTable: ProcessTableRelationshipInterface) => prcsTable.processName === processName && this.tablesList.includes(prcsTable.tableName)).length;
  }

  get tableNames() {
    return this.processTableForm.get('tableNames') as FormArray;
  }
}
