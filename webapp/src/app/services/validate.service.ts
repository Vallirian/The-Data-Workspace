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
      const value = control.get('value');
      const dataType = control.get('dataType');
      let isValid = true;
      if (dataType?.value === 'string') {
        isValid = true
      }

      return isValid ? null : {invalidDataType: {value: control.value}};
      // return forbidden ? {forbiddenName: {value: control.value}} : null;
    };
  }

  expo(dataType: string): ValidatorFn {
    let validator: ValidatorFn | null;

    switch (dataType) {
      case 'string':
        validator = Validators.compose([
          Validators.required, 
          Validators.minLength(2)
        ]);
        break;
      case 'number':
        validator = Validators.compose([
          Validators.required, 
          Validators.pattern("^[0-9]+(\\.[0-9]+)?$")
        ]);
        break;
      case 'email':
        validator = Validators.compose([
          Validators.required, 
          Validators.email
        ]);
        break;
      default:
        validator = Validators.compose([]);  // This might return null
    }
  
    // Ensure the returned function always matches ValidatorFn type
    return (control: AbstractControl): { [key: string]: any } | null => {
      return validator ? validator(control) : null;
    };
  }
}