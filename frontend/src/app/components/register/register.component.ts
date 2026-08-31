import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
  isLoading = false;
  showError = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.showError = true;
    this.errorMessage = '';

    if (!this.nombre || !this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    this.isLoading = true;
    this.authService.register(this.nombre, this.email, this.password).subscribe({
      next: () => {
        void this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        this.errorMessage = err.error?.message || 'Error al registrar usuario.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
        this.showError = false;
      }
    });
  }

}
