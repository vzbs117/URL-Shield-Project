export interface ReportUserRef {
  _id: string;
  email: string;
}

export interface Report {
  _id: string;
  url: string;
  status: 'seguro' | 'no seguro';
  createdAt: string;
  updatedAt?: string;
  user?: ReportUserRef;
  result?: unknown;
}

export interface ReportListResponse {
  total: number;
  count: number;
  data: Report[];
}

export interface ReportDetailResponse {
  message: string;
  response: Report;
}

export interface AnalyzeUrlResponse {
  message: string;
  status: 'seguro' | 'no seguro';
  data: Report;
}
