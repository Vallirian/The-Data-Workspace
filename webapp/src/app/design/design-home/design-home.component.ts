import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UtilService } from '../../services/util.service';
import { CommonModule } from '@angular/common';
import { ProfilePictureComponent } from '../../components/profile-picture/profile-picture.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

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

  constructor(
    private utilService: UtilService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {
    this.greeing = utilService.getGreeting();
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
        console.error('workspace creation failed', err);
      }
    });
  }


  get userName() {
    return String(this.authService.currentUser()?.username);
  }
}
