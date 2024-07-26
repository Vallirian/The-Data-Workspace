import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  baseUrl = 'ws://localhost:8000/ws';
  analysisChatSocket = webSocket(`${this.baseUrl}/analysis-chat/`);

  constructor() { }
}
