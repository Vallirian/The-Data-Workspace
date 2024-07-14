import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ValidateService } from '../../../services/validate.service';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})

export class SignupComponent {
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
    private notficationService: NotificationService,
    private router: Router
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
        this.notficationService.addSuccessNotification('Signup successful, welcome!');
        this.router.navigate(['/login']);
      },
      error: err => {
        this.notficationService.addErrorNotification('Signup failed, please try again.');
      }
    })
  }
}
