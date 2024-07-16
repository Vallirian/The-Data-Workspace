import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableListInterface, WorkspaceListInterface } from '../../../interfaces/main-interface';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfilePictureComponent } from '../../../components/profile-picture/profile-picture.component';

@Component({
  selector: 'app-workspace-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProfilePictureComponent
  ],
  templateUrl: './workspace-home.component.html',
  styleUrl: './workspace-home.component.scss'
})
export class WorkspaceHomeComponent {
  workspaceId: string = '';
  workspace: WorkspaceListInterface | null = null;
  tablesList: TableListInterface[] = [];

  tableCreationForm = this.formBuilder.group({
    displayName: ['', [Validators.required]],
    description: [''],
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.workspaceId = this.activatedRoute.snapshot.params['id'];
    this.apiService.getWorkspace(this.workspaceId).subscribe({
      next: (workspace: WorkspaceListInterface) => {
        this.workspace = workspace;
        this.apiService.listTables(this.workspaceId).subscribe({
          next: (tables: TableListInterface[]) => {
            this.tablesList = tables;
          },
          error: (err) => {
            this.notificationService.addNotification({message: 'Failed to fetch tables', type: 'error', dismissed: false, remainingTime: 5000});
          }
        });

      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load workspace', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  // table  
  createTable() {
    const table: {displayName: string, description: string} = {
      displayName: this.tableCreationForm.value.displayName!,
      description: this.tableCreationForm.value.description!
    };
    console.log(table);
    this.apiService.createTable(this.workspaceId, table).subscribe({
      next: (newTable: TableListInterface) => {
        this.tablesList.push(newTable);
        this.tableCreationForm.reset();
        this.notificationService.addNotification({message: 'Table created successfully', type: 'success', dismissed: false, remainingTime: 5000});
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to create table', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  navigateToTable(tableId: string) {
    this.router.navigate([`/design/workspace/${this.workspaceId}/table/${tableId}`]);
  }
}
