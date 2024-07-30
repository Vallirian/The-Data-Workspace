import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ColumnInterface, CopilotChatInterface, CopilotMessageInterface, RelationshipColumnAPIInterface, TableListInterface, WorkspaceListInterface } from '../interfaces/main-interface';

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

  getRawTableLimitedColumns(tableId: string, columns: string[]) {
    const params = new HttpParams()
      .set('columns', columns.join(','));
    return this.http.get(`${this.baseUrl}/raw/${tableId}/`, {params});
  }
  
  // copilot API
  listAnalysisChats() {
    return this.http.get<CopilotChatInterface[]>(`${this.baseUrl}/copilot/analysis/`);
  }

  getAnalysisChat(chatId: string) {
    const params = new HttpParams()
      .set('chatId', chatId);
    return this.http.get<CopilotMessageInterface[]>(`${this.baseUrl}/copilot/analysis/`, {params});
  }

  startAnalysisChat(message: string) {
    return this.http.post<CopilotMessageInterface>(`${this.baseUrl}/copilot/analysis/`, {'message': message});
  }

  sendMessageAnalysisChat(chatId: string, message: string) {
    const params = new HttpParams()
      .set('chatId', chatId);
    return this.http.put<CopilotMessageInterface>(`${this.baseUrl}/copilot/analysis/`, {'message': message}, {params});
  }

















  // raw Table API
  updateRawTable(tableId: string, data: any) {
    return this.http.put(`${this.baseUrl}/raw/${tableId}/`, data);
  }




  // copilot API



  




}
