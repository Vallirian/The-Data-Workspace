import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { WorkbookInterface } from '../interfaces/main';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseApiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient
  ) { }

  // Workbooks 
  getWorkbooksList() {
    return this.http.get<WorkbookInterface[]>(`${this.baseApiUrl}/workbooks/`);
  }

  getWorkbook(id: string) {
    return this.http.get<WorkbookInterface>(`${this.baseApiUrl}/workbooks/${id}/`);
  }

  createWorkbook() {
    return this.http.post<WorkbookInterface>(`${this.baseApiUrl}/workbooks/`, {});
  }

  deleteWorkbook(id: string) {
    return this.http.delete(`${this.baseApiUrl}/workbooks/${id}/`);
  }
}
