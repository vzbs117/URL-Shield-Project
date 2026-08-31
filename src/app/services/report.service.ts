import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AnalyzeUrlResponse,
  ReportDetailResponse,
  ReportListResponse,
} from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = '/api/responses';

  constructor(private http: HttpClient) {}

  analyzeUrl(url: string): Observable<AnalyzeUrlResponse> {
    return this.http.post<AnalyzeUrlResponse>(this.apiUrl, { url });
  }

  getMyReports(): Observable<ReportListResponse> {
    return this.http.get<ReportListResponse>(`${this.apiUrl}/mine`);
  }

  getAllReports(limit = 50, skip = 0): Observable<ReportListResponse> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('skip', skip.toString());

    return this.http.get<ReportListResponse>(this.apiUrl, { params });
  }

  getReport(reportId: string): Observable<ReportDetailResponse> {
    return this.http.get<ReportDetailResponse>(`${this.apiUrl}/${reportId}`);
  }

  deleteReport(reportId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${reportId}`);
  }
}
