import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, AuthError } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { emailValidator } from '../../core/validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
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

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email, emailValidator()]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
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
      return 'Password must be at least 6 characters';
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
    if (!this.form.valid) {
      this.errorMessage = 'Please fix the errors above';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password, rememberMe } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: () => {
        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.removeItem('rememberEmail');
        }
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err: AuthError) => {
        this.errorMessage = err.message;
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

