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

  // Workspace API
  createWorkspace(data: {displayName: string}) {
    return this.http.post(`${this.baseUrl}/workspace/`, data);
  }

  listWorkspaces() {
    return this.http.get<WorkspaceListInterface[]>(`${this.baseUrl}/workspace/`);
  }

  getWorkspace(id: string) {
    return this.http.get<WorkspaceListInterface>(`${this.baseUrl}/workspace/${id}`);
  }

  // Table API
  listTables() {
    return this.http.get<TableListInterface[]>(`${this.baseUrl}/table/`);
  }

  getTable(id: string) {
    return this.http.get<TableListInterface>(`${this.baseUrl}/table/${id}`);
  }

  createTable(data: {displayName: string, description: string}) {
    return this.http.post<TableListInterface>(`${this.baseUrl}/table/`, data);
  }

  // Column API
  listColumns(ids: string[]) {
    const params = new HttpParams()
      .set('ids', ids.join(','));
    return this.http.get<ColumnInterface[]>(`${this.baseUrl}/column/`, {params});
  }

  listColumnsByTable(tableId: string) {
    const params = new HttpParams()
      .set('tableId', tableId);
    return this.http.get<ColumnInterface[]>(`${this.baseUrl}/column/`, {params});
  }

  createColumn(tableId: string, data: {displayName: string, description: string, dataType: 'string' | 'number' | 'datetime' | 'boolean', table: string}) {
    const params = new HttpParams()
      .set('tableId', tableId);
    return this.http.post<ColumnInterface>(`${this.baseUrl}/column/`, data, {params});
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
  getRawTable(tableId: string) {
    return this.http.get(`${this.baseUrl}/raw/${tableId}/`);
  }

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
