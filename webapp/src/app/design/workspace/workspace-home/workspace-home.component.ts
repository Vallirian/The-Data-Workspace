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
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to load workspace', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }
}
