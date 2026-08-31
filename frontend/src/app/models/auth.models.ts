import { User } from './user.models';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthState {
  loggedIn: boolean;
  isAdmin: boolean;
  token: string | null;
}
