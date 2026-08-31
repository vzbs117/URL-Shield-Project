import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report.models';
import { CreateUserPayload, UpdateUserPayload, User } from '../../models/user.models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  consultas: Report[] = [];
  paginatedUsers: User[] = [];
  paginatedConsultas: Report[] = [];
  activeSection = 'usuarios';
  searchUser = '';
  showModal = false;
  modalType: 'user' | 'consulta' = 'user';
  modalTitle = '';
  selectedUser: (CreateUserPayload & { _id?: string }) | null = null;
  selectedConsulta: Report | null = null;
  loadingUsers = false;
  loadingConsultas = false;
  savingUser = false;
  errorMessage = '';
  currentPageUsers = 1;
  currentPageConsultas = 1;
  itemsPerPage = 5;
  totalPagesUsers = 1;
  totalPagesConsultas = 1;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.restoreSession();
  }

  private restoreSession(): void {
    if (!this.authService.isLoggedIn()) {
      void this.router.navigate(['/login']);
      return;
    }

    this.loadUsers();
    this.loadConsultas();
  }

  private handleError(error: any, mensaje: string): void {
    console.error(mensaje, error);
    this.errorMessage = `${mensaje}: ${error.error?.message || error.message}`;
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.errorMessage = '';

    this.userService.getUsers()
      .pipe(finalize(() => {
        this.loadingUsers = false;
      }))
      .subscribe({
        next: ({ users }) => {
          this.users = users;
          this.totalPagesUsers = Math.max(1, Math.ceil(this.users.length / this.itemsPerPage));
          this.updatePaginatedUsers();
        },
        error: (error) => {
          this.handleError(error, 'Error al cargar usuarios');
        }
      });
  }

  loadConsultas(): void {
    this.loadingConsultas = true;
    this.errorMessage = '';

    this.reportService.getAllReports()
      .pipe(finalize(() => {
        this.loadingConsultas = false;
      }))
      .subscribe({
        next: ({ data }) => {
          this.consultas = data;
          this.totalPagesConsultas = Math.max(1, Math.ceil(this.consultas.length / this.itemsPerPage));
          this.updatePaginatedConsultas();
        },
        error: (error) => {
          this.handleError(error, 'Error al cargar consultas');
        }
      });
  }

  updatePaginatedUsers(): void {
    const filteredUsers = this.searchUser
      ? this.users.filter((user) =>
          user.nombre.toLowerCase().includes(this.searchUser.toLowerCase())
        )
      : this.users;

    this.totalPagesUsers = Math.max(1, Math.ceil(filteredUsers.length / this.itemsPerPage));
    if (this.currentPageUsers > this.totalPagesUsers) {
      this.currentPageUsers = this.totalPagesUsers;
    }

    const start = (this.currentPageUsers - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedUsers = filteredUsers.slice(start, end);
  }

  updatePaginatedConsultas(): void {
    const start = (this.currentPageConsultas - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedConsultas = this.consultas.slice(start, end);
  }

  viewConsultaDetail(consulta: Report): void {
    if (!consulta || !consulta._id) {
      this.errorMessage = 'ID de consulta inválido.';
      return;
    }

    this.modalType = 'consulta';
    this.modalTitle = 'Detalles de la Consulta';
    this.loadingConsultas = true;

    this.reportService.getReport(consulta._id)
      .pipe(finalize(() => {
        this.loadingConsultas = false;
      }))
      .subscribe({
        next: ({ response }) => {
          this.selectedConsulta = response;
          this.showModal = true;
        },
        error: (error) => {
          this.handleError(error, 'Error al obtener los detalles de la consulta');
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }

  showSection(section: string): void {
    this.activeSection = section;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
    this.selectedConsulta = null;
  }

  openUserModal(user: User | null): void {
    this.modalType = 'user';
    this.modalTitle = user ? 'Editar Usuario' : 'Agregar Usuario';
    this.selectedUser = user
      ? { _id: user._id, nombre: user.nombre, email: user.email, role: user.role, password: '' }
      : { nombre: '', email: '', role: 'user', password: '' };
    this.showModal = true;
  }

  confirmDeleteUser(user: User): void {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${user.nombre}?`)) {
      this.userService.deleteUser(user._id).subscribe({
        next: () => {
          this.users = this.users.filter((currentUser) => currentUser._id !== user._id);
          this.updatePaginatedUsers();
        },
        error: (error) => {
          this.handleError(error, 'Error al eliminar usuario');
        }
      });
    }
  }

  confirmDeleteConsulta(consulta: Report): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta consulta?')) {
      this.reportService.deleteReport(consulta._id).subscribe({
        next: () => {
          this.consultas = this.consultas.filter((currentReport) => currentReport._id !== consulta._id);
          this.updatePaginatedConsultas();
        },
        error: (error) => {
          this.handleError(error, 'Error al eliminar consulta');
        }
      });
    }
  }

  previousPageUsers(): void {
    if (this.currentPageUsers > 1) {
      this.currentPageUsers--;
      this.updatePaginatedUsers();
    }
  }

  nextPageUsers(): void {
    if (this.currentPageUsers < this.totalPagesUsers) {
      this.currentPageUsers++;
      this.updatePaginatedUsers();
    }
  }

  previousPageConsultas(): void {
    if (this.currentPageConsultas > 1) {
      this.currentPageConsultas--;
      this.updatePaginatedConsultas();
    }
  }

  nextPageConsultas(): void {
    if (this.currentPageConsultas < this.totalPagesConsultas) {
      this.currentPageConsultas++;
      this.updatePaginatedConsultas();
    }
  }

  saveModal(): void {
    if (!this.validateUserForm()) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    this.savingUser = true;
    this.errorMessage = '';

    if (this.selectedUser?._id) {
      const payload: UpdateUserPayload = {
        nombre: this.selectedUser.nombre,
        email: this.selectedUser.email,
        role: this.selectedUser.role,
      };

      if (this.selectedUser.password) {
        payload.password = this.selectedUser.password;
      }

      this.userService.updateUser(this.selectedUser._id, payload)
        .pipe(finalize(() => {
          this.savingUser = false;
        }))
        .subscribe({
          next: ({ user }) => {
            const index = this.users.findIndex((currentUser) => currentUser._id === user._id);
            if (index !== -1) {
              this.users[index] = user;
            }
            this.updatePaginatedUsers();
            this.closeModal();
          },
          error: (error) => {
            this.handleError(error, 'Error al guardar usuario');
          }
        });
      return;
    }

    const payload: CreateUserPayload = {
      nombre: this.selectedUser!.nombre,
      email: this.selectedUser!.email,
      role: this.selectedUser!.role,
      password: this.selectedUser!.password,
    };

    this.userService.createUser(payload)
      .pipe(finalize(() => {
        this.savingUser = false;
      }))
      .subscribe({
        next: ({ user }) => {
          this.users.push(user);
          this.updatePaginatedUsers();
          this.closeModal();
        },
        error: (error) => {
          this.handleError(error, 'Error al guardar usuario');
        }
      });
  }

  validateUserForm(): boolean {
    if (!this.selectedUser || !this.selectedUser.nombre || !this.selectedUser.email || !this.selectedUser.role) {
      return false;
    }

    return !!this.selectedUser._id || !!this.selectedUser.password;
  }
}
