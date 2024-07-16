import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UtilService } from '../../services/util.service';
import { CommonModule } from '@angular/common';
import { ProfilePictureComponent } from '../../components/profile-picture/profile-picture.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationInterface, WorkspaceListInterface } from '../../interfaces/main-interface';
import { NotificationService } from '../../services/notification.service';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-design-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    ProfilePictureComponent,
  ],
  templateUrl: './design-home.component.html',
  styleUrl: './design-home.component.scss'
})
export class DesignHomeComponent {
  greeing: string = 'Hello'
  notifications: NotificationInterface[] = [];


  workspaceCreationForm = this.formBuilder.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
  });
  workSpacesList: WorkspaceListInterface[] = []


  constructor(
    private utilService: UtilService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.greeing = utilService.getGreeting();
  }

  ngOnInit(): void {
    this.apiService.listWorkspaces().subscribe({
      next: (workspaces: WorkspaceListInterface[]) => {
        this.workSpacesList = workspaces;
      },
      error: (err) => {
        this.notificationService.addNotification({message: 'Failed to fetch workspaces', type: 'error', dismissed: false, remainingTime: 5000});
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
        this.notificationService.addNotification({message: 'Workspace created successfully', type: 'success', dismissed: false, remainingTime: 5000});
        this.workspaceCreationForm.reset();
        this.apiService.listWorkspaces().subscribe({
          next: (workspaces: WorkspaceListInterface[]) => {
            this.workSpacesList = workspaces;
          },
          error: (err) => {
            this.notificationService.addNotification({message: err || 'Failed to fetch workspaces', type: 'error', dismissed: false, remainingTime: 5000});
          }
        });
      },
      error: (err) => {
        this.notificationService.addNotification({message: err || 'Failed to create workspace', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }


  get userName() {
    return String(this.authService.currentUser()?.username);
  }

  navigateToWorkspace(workspaceId: string) {
    this.router.navigate(['design/workspace', workspaceId]);
  }
}
