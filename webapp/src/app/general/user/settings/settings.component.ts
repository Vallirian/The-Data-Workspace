import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { ValidateService } from '../../../services/validate.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

  newUserForm = this.formBuilder.group({
    username: [''],
    password: [''],
    email: [''],
    role: ['member'],
  });

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private valdateService: ValidateService
  ){}

  onInviteNewUser(): void {
    // HACK: This is not a production ready method. It is just a placeholder for the sake of the demo.
    // TODO: Implement a proper user registration method
    const newUser = this.newUserForm.value;
    const emailValidation = this.valdateService.validateEmail(newUser.email!);
    if (!emailValidation.valid) {
      this.notificationService.addNotification({message: emailValidation.message, type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }
    const passwordValidation = this.valdateService.validatePassword(newUser.password!);
    if (!passwordValidation.valid) {
      this.notificationService.addNotification({message: passwordValidation.message, type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }
    const usernameValidation = this.valdateService.nonEmptyValidator(newUser.username!);
    if (!usernameValidation.valid) {
      this.notificationService.addNotification({message: usernameValidation.message, type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }

    this.apiService.inviteNewUser(newUser).subscribe({
      next: (response) => {
        this.notificationService.addNotification({message: 'User invited successfully', type: 'success', dismissed: false, remainingTime: 5000});
      },
      error: (err) => {
        this.notificationService.addNotification({message: err.error.error || 'Failed to invite user', type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
    

  }

}
