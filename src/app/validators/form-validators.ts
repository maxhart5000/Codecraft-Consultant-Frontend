import { FormControl, ValidationErrors } from '@angular/forms';

/**
 * Custom form validator class.
 */
export class FormValidators {
  /**
   * Validator function to check if the control value contains only whitespace.
   * @param control The form control to be validated.
   * @returns Validation errors if the control value contains only whitespace, otherwise null.
   */
  static notOnlyWhitespace(control: FormControl): ValidationErrors {
    if (control.value != null && control.value.trim().length === 0) {
      return { notOnlyWhitespace: true };
    } else {
      return null!;
    }
  }
}
