import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateUserPayload,
  UpdateUserPayload,
  UserProfileResponse,
  UserResponse,
  UsersResponse,
} from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/profile`);
  }

  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(this.apiUrl);
  }

  createUser(payload: CreateUserPayload): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, payload);
  }

  updateUser(userId: string, payload: UpdateUserPayload): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${userId}`, payload);
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${userId}`);
  }
}
