import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ColumnInterface, RelationshipColumnAPIInterface, TableListInterface, WorkspaceListInterface } from '../interfaces/main-interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient
  ) { }
  // Table API
  listTables() {
    return this.http.get<string[]>(`${this.baseUrl}/table/`);
  }

  createTable(tableName: string) {
    return this.http.post<string>(`${this.baseUrl}/table/`, {'tableName': tableName});
  }

  // Column API
  listColumns(tableName: string) {
    return this.http.get<ColumnInterface[]>(`${this.baseUrl}/table/${tableName}/column/`);
  }

  createColumn(tableName: string, data: ColumnInterface) {
    return this.http.post<ColumnInterface>(`${this.baseUrl}/table/${tableName}/column/`, data);
  }

  // raw Table API
  getRawTable(tableId: string) {
    return this.http.get(`${this.baseUrl}/raw/${tableId}/`);
  }













// Table API
  getTable(id: string) {
    return this.http.get<TableListInterface>(`${this.baseUrl}/table/${id}`);
  }


  // Column API

  listColumnsByTable(tableId: string) {
    const params = new HttpParams()
      .set('tableId', tableId);
    return this.http.get<ColumnInterface[]>(`${this.baseUrl}/column/`, {params});
  }



  // Relationship Column API
  listRelationshipColumns(tableId: string) {
    return this.http.get<ColumnInterface[]>(`${this.baseUrl}/relationship/${tableId}/`);
  }

  createRelationshipColumn(tableId: string, data: {rightTableColumn: string}) {
    return this.http.post<ColumnInterface>(`${this.baseUrl}/relationship/${tableId}/`, data);
  }
  
  listRelationhipColumnsByTable(tableId: string) {
    return this.http.get<RelationshipColumnAPIInterface[]>(`${this.baseUrl}/relationship/${tableId}/`);
  }


  // raw Table API


  updateRawTable(tableId: string, data: any) {
    return this.http.put(`${this.baseUrl}/raw/${tableId}/`, data);
  }

  getRawTableLimitedColumns(tableId: string, columns: string[]) {
    const params = new HttpParams()
      .set('columns', columns.join(','));
    return this.http.get(`${this.baseUrl}/raw/${tableId}/`, {params});
  }


  // copilot API
  listAnalysisChats() {
    return this.http.get<any[]>(`${this.baseUrl}/copilot/analysis/`);
  }

  getAnalysisChat(conversationId: string) {
    const params = new HttpParams()
      .set('conversationId', conversationId);
    return this.http.get<any>(`${this.baseUrl}/copilot/analysis/`, {params});
  }
  
  startAnalysisChat(message: string) {
    return this.http.post(`${this.baseUrl}/copilot/analysis/`, {'message': message});
  }

  sendMessageAnalysisChat(conversationId: string, message: string) {
    const params = new HttpParams()
      .set('conversationId', conversationId);
    return this.http.put(`${this.baseUrl}/copilot/analysis/`, {'message': message}, {params});
  }

}
