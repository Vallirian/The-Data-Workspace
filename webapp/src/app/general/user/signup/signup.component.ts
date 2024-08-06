import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ValidateService } from '../../../services/validate.service';
import { Router } from '@angular/router';
import { NotificationInterface } from '../../../interfaces/main-interface';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})

export class SignupComponent {
  notifications: NotificationInterface[] = [];

  signupForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    username: ['', [Validators.required, Validators.minLength(4)]],
    tenantDisplayName: ['', [Validators.required, Validators.minLength(1)]],
  })

  signupFormError = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private validateService: ValidateService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onSignup() {
    // validate the form
    const signupFormValue = this.signupForm.value;
    const emailValidation = this.validateService.validateEmail(signupFormValue.email!);
    if (!emailValidation.valid) {
      this.signupFormError = emailValidation.message;
      return;
    }

    const passwordValidation = this.validateService.validatePassword(signupFormValue.password!);
    if (!passwordValidation.valid) {
      this.signupFormError = passwordValidation.message;
      return;
    }

    const usernameValidation = this.validateService.nonEmptyValidator(signupFormValue.username!);
    if (!usernameValidation.valid) {
      this.signupFormError = usernameValidation.message;
      return;
    }

    const tenantDisplayNameValidation = this.validateService.nonEmptyValidator(signupFormValue.tenantDisplayName!);
    if (!tenantDisplayNameValidation.valid) {
      this.signupFormError = tenantDisplayNameValidation.message;
      return;
    }

    this.authService.signup({
      email: signupFormValue.email!,
      password: signupFormValue.password!,
      username: signupFormValue.username!,
      tenantDisplayName: signupFormValue.tenantDisplayName!
    }).subscribe({
      next: res => {
        this.notificationService.addNotification({message: 'Signup successful', type: 'success', dismissed: false, remainingTime: 5000});
        this.router.navigate(['/login']);
      },
      error: err => {
        this.notificationService.addNotification({message: err || 'Failed to signup', type: 'error', dismissed: false, remainingTime: 5000});
      }
    })
  }
}