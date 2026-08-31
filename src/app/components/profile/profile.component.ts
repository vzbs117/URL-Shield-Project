import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report.models';
import { User } from '../../models/user.models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  newPassword = '';
  consultas: Report[] = [];
  paginatedConsultas: Report[] = [];
  isLoadingConsultas = false;
  isSavingPassword = false;
  errorMessage = '';
  successMessage = '';
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  filterDate = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadUserConsultas();
  }

  private loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: ({ user }) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Error al cargar el perfil:', err);
        this.errorMessage = err.error?.message || 'Error al cargar el perfil.';
      }
    });
  }

  loadUserConsultas(): void {
    this.isLoadingConsultas = true;
    this.errorMessage = '';

    this.reportService.getMyReports()
      .pipe(finalize(() => {
        this.isLoadingConsultas = false;
      }))
      .subscribe({
        next: ({ data }) => {
          this.consultas = data;
          this.totalPages = Math.max(1, Math.ceil(this.consultas.length / this.itemsPerPage));
          this.updatePaginatedConsultas();
        },
        error: (error) => {
          console.error('Error al cargar las consultas:', error);
          this.errorMessage = error.error?.message || 'Ocurrió un error al cargar las consultas.';
        }
      });
  }

  updatePaginatedConsultas(): void {
    let filteredConsultas = this.consultas;

    if (this.filterDate) {
      filteredConsultas = this.consultas.filter((consulta) => {
        const consultaDate = new Date(consulta.createdAt).toISOString().split('T')[0];
        return consultaDate === this.filterDate;
      });
    }

    this.totalPages = Math.max(1, Math.ceil(filteredConsultas.length / this.itemsPerPage));
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedConsultas = filteredConsultas.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedConsultas();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedConsultas();
    }
  }

  filterConsultasByDate(): void {
    this.currentPage = 1;
    this.updatePaginatedConsultas();
  }

  changePassword(): void {
    if (!this.user?._id || !this.newPassword) {
      this.errorMessage = 'Por favor, ingresa una nueva contraseña.';
      return;
    }

    this.isSavingPassword = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.updateUser(this.user._id, { password: this.newPassword })
      .pipe(finalize(() => {
        this.isSavingPassword = false;
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'Contraseña actualizada con éxito.';
          this.newPassword = '';
        },
        error: (error) => {
          console.error('Error al cambiar la contraseña:', error);
          this.errorMessage = error.error?.message || 'Ocurrió un error al cambiar la contraseña.';
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
