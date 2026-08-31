import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private storageService: StorageService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.storageService.getItem('token');

    if (!token || !req.url.startsWith('/api')) {
      return next.handle(req);
    }

    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(clonedRequest);
  }
}
