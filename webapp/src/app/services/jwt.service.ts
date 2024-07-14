import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  constructor() { }

  decodeJwt(jwt: string): any {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      throw new Error('JWT must have 3 parts');
    }

    const payload = parts[1];
    return this.decodeBase64Url(payload);
  }

  private decodeBase64Url(base64UrlString: string): any {
    const base64 = base64UrlString.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - base64.length % 4) % 4;
    const paddedBase64 = base64 + '='.repeat(padding);
    
    try {
      const decodedJson = atob(paddedBase64);
      return JSON.parse(decodedJson);
    } catch (e) {
      console.error('Error decoding or parsing JWT:', e);
      return null;
    }
  }
}
