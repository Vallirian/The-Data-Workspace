import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

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

  valueDataTypeFormValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.get('value')?.value;
      const dataType = control.get('dataType')?.value;
      let isValid = true;

      if (dataType === null || dataType === undefined || dataType === '') {
        isValid = false;
      }

      else if (dataType === 'string') {
        const cleanedValue = value.trim();
        isValid = cleanedValue.length > 0 && cleanedValue.length <= 255;
      }
      else if (dataType === 'number') {
        isValid = !isNaN(Number(value));
      }
      else if (dataType === 'datetime') {
        isValid = !isNaN(Date.parse(value));
      }
      else if (dataType === 'boolean') {
        isValid = value === 'true' || value === 'false';
      }    

      return isValid ? null : {invalidDataType: {value: control.value}};
    };
  }
}