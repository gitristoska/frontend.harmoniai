import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, AuthError } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { passwordMatchValidator, passwordStrengthValidator, emailValidator } from '../../core/validators';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent implements OnInit {
  form!: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  // Password strength indicators
  passwordStrengthScore = 0;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email, emailValidator()]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            passwordStrengthValidator()
          ]
        ],
        confirmPassword: ['', [Validators.required]],
        agreeToTerms: [false, [Validators.requiredTrue]]
      },
      {
        validators: passwordMatchValidator('password', 'confirmPassword')
      }
    );

    // Update password strength on input
    this.form.get('password')?.valueChanges.subscribe(() => {
      this.updatePasswordStrength();
    });
  }

  /**
   * Calculate password strength score (0-4)
   */
  private updatePasswordStrength(): void {
    const password = this.form.get('password')?.value;
    if (!password) {
      this.passwordStrengthScore = 0;
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    this.passwordStrengthScore = score;
  }

  /**
   * Get password strength label and class
   */
  getPasswordStrengthLabel(): { label: string; class: string } {
    const scores = [
      { label: '', class: '' },
      { label: 'Weak', class: 'weak' },
      { label: 'Fair', class: 'fair' },
      { label: 'Good', class: 'good' },
      { label: 'Strong', class: 'strong' }
    ];
    return scores[this.passwordStrengthScore] || scores[0];
  }

  /**
   * Get error message for fullName field
   */
  getFullNameErrorMessage(): string {
    const control = this.form.get('fullName');
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return 'Full name is required';
    }
    if (control.hasError('minlength')) {
      return 'Full name must be at least 2 characters';
    }
    return 'Invalid name';
  }

  /**
   * Get error message for email field
   */
  getEmailErrorMessage(): string {
    const control = this.form.get('email');
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
   * Get error message for password field
   */
  getPasswordErrorMessage(): string {
    const control = this.form.get('password');
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return 'Password is required';
    }
    if (control.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    if (control.hasError('weakPassword')) {
      const errors = control.getError('weakPassword');
      const missing = [];
      if (!errors.hasUpperCase) missing.push('uppercase letter');
      if (!errors.hasLowerCase) missing.push('lowercase letter');
      if (!errors.hasNumeric) missing.push('number');
      return `Password needs: ${missing.join(', ')}`;
    }
    return 'Invalid password';
  }

  /**
   * Get error message for confirm password field
   */
  getConfirmPasswordErrorMessage(): string {
    const control = this.form.get('confirmPassword');
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return 'Please confirm your password';
    }
    if (this.form.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return 'Invalid confirmation';
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Check if a field has an error and has been touched
   */
  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (!this.form.valid) {
      this.errorMessage = 'Please fix the errors above';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { fullName, email, password } = this.form.value;

    this.auth.signup(fullName, email, password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err: AuthError) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }
}
