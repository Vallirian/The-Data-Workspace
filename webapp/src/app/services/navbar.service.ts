import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  buttons = signal<{label: string, action: Function}[]>([])
  
  constructor() { }
}
