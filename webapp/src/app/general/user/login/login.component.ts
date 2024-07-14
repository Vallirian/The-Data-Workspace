import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ValidateService } from '../../../services/validate.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
    private router: Router
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
    this.authService.login({email: loginFormValue.email!, password: loginFormValue.password!}).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loginFormError = err.error.detail;
      }
    })
  }
}
