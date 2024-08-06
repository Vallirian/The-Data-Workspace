import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ColumnInterface, CopilotChatInterface, CopilotMessageInterface, ProcessInterface, ProcessTableRelationshipInterface} from '../interfaces/main-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

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

  // Process API
  listProcesses() {
    return this.http.get<ProcessInterface[]>(`${this.baseUrl}/process/`);
  }

  createProcess(processName: string, processDescription: string) {
    return this.http.post<string>(`${this.baseUrl}/process/`, {'processName': processName, 'processDescription': processDescription});
  }
  
  getPrcessTables(processId: string) {
    return this.http.get<ProcessTableRelationshipInterface[]>(`${this.baseUrl}/process/${processId}/`);
  }

  updateProcessTable(processId: string, tableNames: string[]) {
    return this.http.put<string[]>(`${this.baseUrl}/process/${processId}/`, {'tableNames': tableNames});
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

  updateRawTable(tableId: string, data: any) {
    return this.http.put(`${this.baseUrl}/raw/${tableId}/`, data);
  }
  
  // copilot API
    // analysis chat
  listAnalysisChats() {
    const params = new HttpParams()
      .set('chatType', 'analysis');
    return this.http.get<CopilotChatInterface[]>(`${this.baseUrl}/copilot/`);
  }

  getAnalysisChat(chatId: string) {
    const params = new HttpParams()
      .set('chatId', chatId);
    return this.http.get<CopilotMessageInterface[]>(`${this.baseUrl}/copilot/`, {params});
  }

  startAnalysisChat(message: string, tableName: string) {
    const params = new HttpParams()
      .set('tableName', tableName)
      .set('chatType', 'analysis');
    return this.http.post<CopilotMessageInterface>(`${this.baseUrl}/copilot/`, {'message': message}, {params});
  }

  sendMessageAnalysisChat(chatId: string, message: string, tableName: string) {
    const params = new HttpParams()
      .set('chatId', chatId)
      .set('tableName', tableName)
      .set('chatType', 'analysis');
    return this.http.put<CopilotMessageInterface>(`${this.baseUrl}/copilot/`, {'message': message}, {params});
  }
  
    // process chat
  startProcessChat(message: string, processName: string) {
    const params = new HttpParams()
      .set('processName', processName)
      .set('chatType', 'process');
    return this.http.post<CopilotMessageInterface>(`${this.baseUrl}/copilot/`, {'message': message}, {params});
  }

  sendMessageProcessChat(chatId: string, message: string, processName: string) {
    const params = new HttpParams()
      .set('chatId', chatId)
      .set('processName', processName)
      .set('chatType', 'process');
    return this.http.put<CopilotMessageInterface>(`${this.baseUrl}/copilot/`, {'message': message}, {params});
  }
    // analysis chat
  listHowToChats() {
    const params = new HttpParams()
      .set('chatType', 'howTo');
    return this.http.get<CopilotChatInterface[]>(`${this.baseUrl}/copilot/`);
  }

  getHowToChat(chatId: string) {
    const params = new HttpParams()
      .set('chatId', chatId);
    return this.http.get<CopilotMessageInterface[]>(`${this.baseUrl}/copilot/`, {params});
  }

  startHowToChat(message: string) {
    const params = new HttpParams()
      .set('chatType', 'howTo');
    return this.http.post<CopilotMessageInterface>(`${this.baseUrl}/copilot/`, {'message': message}, {params});
  }

  sendMessageHowToChat(chatId: string, message: string) {
    const params = new HttpParams()
      .set('chatId', chatId)
      .set('chatType', 'howTo');
    return this.http.put<CopilotMessageInterface>(`${this.baseUrl}/copilot/`, {'message': message}, {params});
  }




  

}
