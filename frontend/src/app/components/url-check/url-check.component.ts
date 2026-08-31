import { Component } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-url-check',
  templateUrl: './url-check.component.html',
  styleUrl: './url-check.component.css'
})
export class UrlCheckComponent {
  url = '';
  isLoading = false;
  message = '';
  isSuccess = false;

  constructor(private reportService: ReportService) {}

  isValidURL(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  analyzeURL(): void {
    if (!this.isValidURL(this.url)) {
      this.setMessage('Por favor, ingresa una URL válida.', false);
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.reportService.analyzeUrl(this.url)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: ({ status }) => {
          if (status === 'seguro') {
            this.setMessage('La URL fue analizada y es segura.', true);
          } else {
            this.setMessage('La URL fue analizada y es NO segura.', false);
          }
        },
        error: (error) => {
          console.error('Error al analizar la URL:', error);
          this.setMessage(error.error?.message || 'Error al analizar la URL. Intenta de nuevo.', false);
        }
      });
  }

  setMessage(message: string, success: boolean): void {
    this.message = message;
    this.isSuccess = success;

    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
