import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UtilService } from '../../services/util.service';
import { CommonModule } from '@angular/common';
import { ProfilePictureComponent } from '../../components/profile-picture/profile-picture.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WorkspaceListInterface } from '../../interfaces/main-interface';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-design-home',
  standalone: true,
  imports: [
    CommonModule,
    ProfilePictureComponent,
    ReactiveFormsModule
  ],
  templateUrl: './design-home.component.html',
  styleUrl: './design-home.component.scss'
})
export class DesignHomeComponent {
  greeing: string = 'Hello'

  workspaceCreationForm = this.formBuilder.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
  });
  workSpacesList: WorkspaceListInterface[] = []


  constructor(
    private utilService: UtilService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {
    this.greeing = utilService.getGreeting();
  }

  ngOnInit(): void {
    this.apiService.listWorkspaces().subscribe({
      next: (workspaces: WorkspaceListInterface[]) => {
        this.workSpacesList = workspaces;
      },
      error: (err) => {
        this.notificationService.addErrorNotification(err.error.detail || 'Failed to fetch workspaces');
      }
    });
  }

  ngOnDestroy(): void {

  }

  createWorkspace() {
    const workspace: {displayName: string} = {
      displayName: this.workspaceCreationForm.value.displayName!
    };
    this.apiService.createWorkspace(workspace).subscribe({
      next: () => {
        console.log('workspace created');
      },
      error: (err) => {
        this.notificationService.addErrorNotification(err.error.detail || 'Failed to create workspace');
      }
    });
  }


  get userName() {
    return String(this.authService.currentUser()?.username);
  }
}
