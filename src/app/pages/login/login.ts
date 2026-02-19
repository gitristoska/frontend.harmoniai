import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, AuthError } from '../../services/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { emailValidator, passwordStrengthValidator } from '../../core/validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, RouterModule],
  providers: [AuthService],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;
  showPassword = false;
  returnUrl: string = '/';
  loginAttempts = 0;
  isLockedOut = false;
  lockoutTimeRemaining = 0;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Load login attempts from localStorage
    const storedAttempts = localStorage.getItem('loginAttempts');
    this.loginAttempts = storedAttempts ? parseInt(storedAttempts, 10) : 0;

    // Check if user is locked out
    const lockoutTime = localStorage.getItem('loginLockoutTime');
    if (lockoutTime) {
      const remainingTime = parseInt(lockoutTime, 10) - Date.now();
      if (remainingTime > 0) {
        this.isLockedOut = true;
        this.lockoutTimeRemaining = Math.ceil(remainingTime / 1000);
        this.startLockoutTimer();
      } else {
        localStorage.removeItem('loginLockoutTime');
        localStorage.removeItem('loginAttempts');
      }
    }

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email, emailValidator()]],
      password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
      rememberMe: [false]
    });
  }

  /**
   * Start countdown timer for lockout
   */
  private startLockoutTimer(): void {
    const interval = setInterval(() => {
      this.lockoutTimeRemaining--;
      if (this.lockoutTimeRemaining <= 0) {
        clearInterval(interval);
        this.isLockedOut = false;
        this.loginAttempts = 0;
        localStorage.removeItem('loginLockoutTime');
        localStorage.removeItem('loginAttempts');
        this.errorMessage = null;
      }
    }, 1000);
  }

  /**
   * Get error message for email field
   */
  getEmailErrorMessage(): string {
    const emailControl = this.form.get('email');
    if (!emailControl || !emailControl.errors) return '';

    if (emailControl.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl.hasError('email') || emailControl.hasError('invalidEmail')) {
      return 'Please enter a valid email address';
    }
    return 'Invalid email';
  }

  /**
   * Get error message for password field
   */
  getPasswordErrorMessage(): string {
    const passwordControl = this.form.get('password');
    if (!passwordControl || !passwordControl.errors) return '';

    if (passwordControl.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    if (passwordControl.hasError('weakPassword')) {
      const errors = passwordControl.getError('weakPassword');
      const missing = [];
      if (!errors.hasUpperCase) missing.push('uppercase letter');
      if (!errors.hasLowerCase) missing.push('lowercase letter');
      if (!errors.hasNumeric) missing.push('number');
      return `Password needs: ${missing.join(', ')}`;
    }
    return 'Invalid password';
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.isLockedOut) {
      this.errorMessage = `Account temporarily locked. Try again in ${this.lockoutTimeRemaining} seconds.`;
      return;
    }

    if (!this.form.valid) {
      this.errorMessage = 'Please fix the errors above';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password, rememberMe } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: () => {
        // Clear login attempts on successful login
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginLockoutTime');
        this.loginAttempts = 0;

        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.removeItem('rememberEmail');
        }
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err: AuthError) => {
        this.loginAttempts++;
        localStorage.setItem('loginAttempts', this.loginAttempts.toString());

        // Lock out after 5 failed attempts for 15 minutes
        if (this.loginAttempts >= 5) {
          const lockoutDuration = 15 * 60 * 1000; // 15 minutes
          const lockoutTime = Date.now() + lockoutDuration;
          localStorage.setItem('loginLockoutTime', lockoutTime.toString());
          this.isLockedOut = true;
          this.lockoutTimeRemaining = 15 * 60;
          this.startLockoutTimer();
          this.errorMessage = `Too many failed attempts. Account locked for 15 minutes. (Attempts: ${this.loginAttempts})`;
        } else {
          this.errorMessage = `${err.message} (Attempt ${this.loginAttempts}/5)`;
        }

        this.isLoading = false;
      }
    });
  }

  /**
   * Check if a field has an error and has been touched
   */
  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}

