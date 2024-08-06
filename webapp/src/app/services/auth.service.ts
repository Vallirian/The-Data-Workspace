import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, PLATFORM_ID, signal, Signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { UserInterface, UserLoginInteface, UserRegisterInteface } from '../interfaces/main-interface';
import { isPlatformBrowser } from '@angular/common';
import { UtilService } from './util.service';
import { JwtService } from './jwt.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authTokenUrl = 'http://localhost:8000/api/token';
  private signupBaseUrl = 'http://localhost:8000/api/user';
  
  private token: string | null = null;
  currentUser = signal<UserInterface | null | undefined>(undefined)

  constructor(
    private http: HttpClient,
    private utilService: UtilService,
    private jwtService: JwtService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('access_token');
    }
    if (this.token) {
      const decodedToken = jwtService.decodeJwt(this.token);
      this.currentUser.set({
        username: decodedToken.username,
        id: decodedToken.user_id
      });
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
    }
  
  }

  isTokenExpired(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    const token = localStorage.getItem('access_token');

    if (!token) {
      return true;
    }
    return this.jwtService.isTokenExpired(token);
  }

  refreshToken(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable();
    }

    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<{ access: string }>(`${this.authTokenUrl}/refresh/`, { refresh: refreshToken }).pipe(
      map(response => response.access),
      tap(newToken => this.saveToken(newToken))
    );
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