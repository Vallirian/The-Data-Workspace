import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    email: ['', Validators.required],
    password: ['', Validators.required],
    username: ['', Validators.required],
    tenantDisplayName: ['', Validators.required]
  })

  constructor(
    private formBuilder: FormBuilder
  ) {}

  onSignup() {
    console.log(this.signupForm.value);
  }
}
