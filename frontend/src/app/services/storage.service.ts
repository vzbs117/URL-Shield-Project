import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && 'localStorage' in window;
  }

  getItem(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error al obtener el ítem de localStorage:', error);
      }
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error al guardar el ítem en localStorage:', error);
      }
    }
  }

  removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error al eliminar el ítem de localStorage:', error);
      }
    }
  }

  clear(): void {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error al limpiar localStorage:', error);
      }
    }
  }
}
