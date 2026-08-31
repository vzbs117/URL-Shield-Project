import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AuthResponse } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response: AuthResponse) => {
        if (response.user.role === 'admin') {
          void this.router.navigate(['/admin-dashboard']);
        } else {
          void this.router.navigate(['/profile']);
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.errorMessage = err.error?.message || 'No se pudo iniciar sesión.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
