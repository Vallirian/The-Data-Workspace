import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ValidateService } from '../../../services/validate.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loginFormError = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private validateService: ValidateService,
    private router: Router,
    private notificationService: NotificationService
  ){}

  onLogin() {
    // validate the form
    const loginFormValue = this.loginForm.value;
    const emailValidation = this.validateService.validateEmail(loginFormValue.email!);
    if (!emailValidation.valid) {
      this.loginFormError = emailValidation.message;
      return;
    }

    const passwordValidation = this.validateService.validatePassword(loginFormValue.password!);
    if (!passwordValidation.valid) {
      this.loginFormError = passwordValidation.message;
      return;
    }

    // login
    this.authService.login(loginFormValue.email!, loginFormValue.password!)
    .then((userCredential) => {
      this.authService.currentUserSignal.set({
        id: userCredential.user.uid, 
        username: userCredential.user.displayName!
      });

      this.authService.setIdToken();

      if (!userCredential.user.emailVerified) {
        this.authService.sendVerificationEmail();
        this.notificationService.addNotification({message: 'Please verify your email, check you eamil!', type: 'error', dismissed: false, remainingTime: 5000});
        return;
      }

      userCredential.user.getIdToken()
      .then((token) => {
        console.log('id token', token);
        if (!token) {
          this.notificationService.addNotification({message: 'Login failed', type: 'error', dismissed: false, remainingTime: 5000});
          return;
        }

        this.authService.idTokenSignal.set(token);
        this.router.navigate(['/home']);
      });

    },
    (error) => {
      console.error(error);
      this.notificationService.addNotification({message: 'Login failed', type: 'error', dismissed: false, remainingTime: 5000});
    });
     

  }
}
