import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor() { }

  validateEmail(email: string): {valid: boolean, message: string | ''}  {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (re.test(email)) {
      return {valid: true, message: ''};
    } else {
      return {valid: false, message: 'Please enter a valid email'};
    }
  }

  validatePassword(password: string): {valid: boolean, message: string | ''} {
    if (password.length < 8) {
      return {valid: false, message: 'The Password field must be at least 8 characters long'};
    }

    if (!/\d/.test(password)) {
      return {valid: false, message: 'The Password field must contain at least one digit'};
    }

    if (!/[A-Z]/.test(password)) {
      return {valid: false, message: 'The Password field must contain at least one uppercase letter'};
    }

    if (!/[a-z]/.test(password)) {
      return {valid: false, message: 'The Password field must contain at least one lowercase letter'};
    }

    if (!/[!@#$%^&*()-+]/.test(password)) {
      return {valid: false, message: 'The Password field must contain at least one special character'};
    }

    return {valid: true, message: ''};
  }

  nonEmptyValidator(value: string): {valid: boolean, message: string | ''} {
    if (value.trim().length === 0) {
      return {valid: false, message: 'The value cannot be empty'};
    }

    return {valid: true, message: ''};
  }
}
