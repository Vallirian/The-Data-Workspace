import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkspaceListInterface } from '../interfaces/main-interface';

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
  createTable(workspaceId: string, data: {displayName: string, description: string}) {
    return this.http.post(`${this.baseUrl}/workspace/${workspaceId}/table/`, data);
  }

}
