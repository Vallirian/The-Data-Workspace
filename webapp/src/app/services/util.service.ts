import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  generateUUID(): string {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }

  b64ToString(base64String: string): string | null {
    // Attempt to decode a Base64 encoded string
    try {
      console.log('Decoding Base64 string:', base64String);
      return atob(base64String);
    } catch (e) {
      console.error('Error decoding Base64 string', e);
      return null;
    }
  }

  b64ToJson(base64String: string): any {
    try {
      const json = this.b64ToString(base64String);
      if (json !== null) {
        return JSON.parse(json);
      } else {
        return null;
      }
    } catch (e) {
      console.error('Error parsing JSON from Base64 string:', e);
      return null;
    }
  }
}
