import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceListInterface } from '../../../interfaces/main-interface';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workspace-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './workspace-home.component.html',
  styleUrl: './workspace-home.component.scss'
})
export class WorkspaceHomeComponent {
  workspaceId: string = '';
  workspace: WorkspaceListInterface | null = null;

  tableCreationForm = this.formBuilder.group({
    displayName: ['', [Validators.required]],
    description: [''],
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.workspaceId = this.activatedRoute.snapshot.params['id'];
    this.apiService.getWorkspace(this.workspaceId).subscribe({
      next: (workspace: WorkspaceListInterface) => {
        this.workspace = workspace;
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
    this.apiService.createTable(this.workspaceId, table);

    console.log('Creating table');
  }
}
