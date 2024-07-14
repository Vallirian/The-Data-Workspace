import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserLoginInteface, UserRegisterInteface } from '../interfaces/main-interface';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authTokenUrl = 'http://localhost:8000/api/token';
  private signupBaseUrl = 'http://localhost:8000/api/user';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // const token = localStorage.getItem('access_token');
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  signup(user: UserRegisterInteface): Observable<any> {
    return this.http.post(`${this.signupBaseUrl}/register/`, user);
  }

  login(user: UserLoginInteface): Observable<any> {
    return this.http.post<{access: string; refresh: string}>(`${this.authTokenUrl}/`, user)
      .pipe(
        tap(tokens => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
          }
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }  
}
