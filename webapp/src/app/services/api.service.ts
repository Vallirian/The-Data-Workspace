import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient
  ) { }

  createWorkspace(data: {displayName: string}) {
    return this.http.post(`${this.baseUrl}/workspace/`, data);
  }

}
