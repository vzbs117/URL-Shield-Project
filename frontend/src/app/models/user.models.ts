export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  id?: string;
  nombre: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileResponse {
  message: string;
  user: User;
}

export interface UsersResponse {
  message: string;
  users: User[];
}

export interface UserResponse {
  message: string;
  user: User;
}

export interface CreateUserPayload {
  nombre: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  nombre?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}
