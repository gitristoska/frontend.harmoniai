import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, AuthError } from '../../services/auth.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { emailValidator, passwordStrengthValidator } from '../../core/validators';

type FormStep = 'email' | 'reset';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent implements OnInit {
  step: FormStep = 'email';
  emailForm!: FormGroup;
  resetForm!: FormGroup;
  
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Step 1: Email form
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, emailValidator()]]
    });

    // Step 2: New password form
    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: this.passwordMatchValidator('password', 'confirmPassword')
      }
    );

    // Check for token and email in query parameters (from reset link)
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];

      if (token && email) {
        // Pre-fill email and skip to reset step
        this.emailForm.patchValue({
          email: email
        });
        this.step = 'reset';
      }
    });
  }

  /**
   * Validate email and request reset code
   */
  requestResetCode(): void {
    if (!this.emailForm.valid) {
      this.errorMessage = 'Please enter a valid email';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email } = this.emailForm.value;

    this.auth.requestPasswordReset(email).subscribe({
      next: () => {
        this.successMessage = `Reset link sent to ${email}`;
        this.step = 'reset';
        this.isLoading = false;
      },
      error: (err: AuthError) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Reset password with new password
   */
  resetPassword(): void {
    if (!this.resetForm.valid) {
      this.errorMessage = 'Please fix the errors above';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { resetToken, password } = this.resetForm.value;

    this.auth.resetPassword(resetToken, password).subscribe({
      next: () => {
        this.successMessage = 'Password reset successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: AuthError) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Go back to previous step
   */
  goBack(): void {
    this.step = 'email';
    this.successMessage = null;
  }

  /**
   * Validator for password match
   */
  private passwordMatchValidator(field1: string, field2: string) {
    return (control: any) => {
      const password = control.get(field1);
      const confirmPassword = control.get(field2);

      if (!password || !confirmPassword) {
        return null;
      }

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  /**
   * Check if field has error
   */
  hasError(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get email error message
   */
  getEmailErrorMessage(): string {
    const control = this.emailForm.get('email');
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return 'Email is required';
    }
    if (control.hasError('email') || control.hasError('invalidEmail')) {
      return 'Please enter a valid email address';
    }
    return 'Invalid email';
  }

  /**
   * Get reset code error message
   */
  getCodeErrorMessage(): string {
    const control = this.resetForm.get('resetToken');
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return 'Reset code is required';
    }
    if (control.hasError('minlength')) {
      return 'Reset token must be at least 6 characters';
    }
    return 'Invalid token';
  }

  /**
   * Get password error message
   */
  getPasswordErrorMessage(): string {
    const control = this.resetForm.get('password');
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return 'Password is required';
    }

    if (control.hasError('weakPassword')) {
      const errors = control.errors['weakPassword'];
      const missing = [];

      if (!errors.hasMinLength) missing.push('8+ characters');
      if (!errors.hasUpperCase) missing.push('uppercase letter');
      if (!errors.hasLowerCase) missing.push('lowercase letter');
      if (!errors.hasNumeric) missing.push('number');

      return `Password must contain: ${missing.join(', ')}`;
    }

    return 'Invalid password';
  }

  /**
   * Get confirm password error message
   */
  getConfirmPasswordErrorMessage(): string {
    const control = this.resetForm.get('confirmPassword');
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return 'Please confirm your password';
    }
    if (this.resetForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return 'Invalid confirmation';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
