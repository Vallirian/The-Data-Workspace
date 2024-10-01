import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DataTableColumnMetaInterface, DataTableMetaInterface, WorkbookInterface } from '../interfaces/main';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseApiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
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

  getDataTableColumnsMeta(workbookId: string, tableId: string) {
    return this.http.get<DataTableColumnMetaInterface[]>(`${this.baseApiUrl}/table-meta/${workbookId}/${tableId}/columns/`);
  }

  // Extraction
  extractData(workbookId: string, tableId: string, data: any) {
    return this.http.post(`${this.baseApiUrl}/table-meta/${workbookId}/${tableId}/extract/`, data);
  }

  deleteData(workbookId: string, tableId: string) {
    return this.http.delete(`${this.baseApiUrl}/table-meta/${workbookId}/${tableId}/extract/`);
  }

  // Raw data
  getRawData(workbookId: string, tableId: string, page: number = 1) {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<any[]>(`${this.baseApiUrl}/table-meta/${workbookId}/${tableId}/raw/`, { params });
  }
}
