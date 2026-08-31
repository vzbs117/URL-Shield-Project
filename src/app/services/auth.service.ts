import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { AuthResponse, AuthState, LoginPayload, RegisterPayload } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = '/api/users';
  private readonly authStatus = new BehaviorSubject<AuthState>({
    loggedIn: false,
    isAdmin: false,
    token: null,
  });

  authStatus$ = this.authStatus.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) {
    this.refreshAuthState();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const payload: LoginPayload = { email: email.trim(), password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => this.persistSession(response.token))
    );
  }

  register(nombre: string, email: string, password: string): Observable<AuthResponse> {
    const payload: RegisterPayload = { nombre: nombre.trim(), email: email.trim(), password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getToken(): string | null {
    return this.isBrowser() ? this.storageService.getItem('token') : null;
  }

  private decodeToken(): { role?: string } | null {
    if (!this.isBrowser()) return null;
    try {
      const token = this.getToken();
      return token ? jwtDecode(token) : null;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  isAdmin(): boolean {
    return this.decodeToken()?.role === 'admin';
  }

  isLoggedIn(): boolean {
    return !!this.decodeToken();
  }

  logout(redirectToLogin = true): void {
    if (!this.isBrowser()) return;
    this.storageService.clear();
    this.authStatus.next({ loggedIn: false, isAdmin: false, token: null });
    if (redirectToLogin) {
      void this.router.navigate(['/login']);
    }
  }

  refreshAuthState(): void {
    if (!this.isBrowser()) return;
    const token = this.getToken();
    this.authStatus.next({
      loggedIn: !!this.decodeToken(),
      isAdmin: this.isAdmin(),
      token,
    });
  }

  private persistSession(token: string): void {
    this.storageService.setItem('token', token);
    this.refreshAuthState();
  }
}
