import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  generateCustomUUID(): string {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    uuid.replace(/-/g, '');
    return uuid;
  }

  getPastelColor(uuid: string): string {
    // Generate a pastel color based on a UUID
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Lowered saturation and adjusted lightness for a more subdued, Pantone-like appearance
    let color = `hsl(${hash % 360}, 20%, 55%)`; // 50% Saturation, 85% Lightness
    return color;
  }

  changeUuidToRelationshipRightTableName(uuid: string): string {
    // Convert a UUID to a relationship right table name
    return `${uuid.replace(/-/g, '')}_id`
  }

  removeUuidDashes(uuid: string): string {
    // Remove dashes from a UUID
    return uuid.replace(/-/g, '');
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
