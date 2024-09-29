import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { DataTableMetaInterface, WorkbookInterface } from '../interfaces/main';

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

  // DataTables
  getDataTableMeta(workbookId: string, tableId: String) {
    return this.http.get<DataTableMetaInterface>(`${this.baseApiUrl}/table-meta/${workbookId}/${tableId}/`);
  }

  // Extraction
  extractData(workbookId: string, tableId: string, data: any) {
    return this.http.post(`${this.baseApiUrl}/table-meta/${workbookId}/${tableId}/extract/`, data);
  }
}
