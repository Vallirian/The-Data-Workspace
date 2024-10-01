import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

function decodeJwt(token: string): any {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

function isTokenNearExpiration(token: string, thresholdMinutes: number = 5): boolean {
  const decoded = decodeJwt(token);
  const currentTime = Math.floor(new Date().getTime() / 1000);
  const expirationTime = decoded.exp; 
  const timeUntilExpiration = expirationTime - currentTime;
  
  return timeUntilExpiration < thresholdMinutes * 60;
}

const addBearerToken = async(req: HttpRequest<any>, next: HttpHandlerFn): Promise<HttpEvent<any>> => {
  const firebaseAuth = inject(Auth);
  const user = await firebaseAuth.currentUser;
  let token = user ? await user.getIdToken() : null;

  const shouldForceRefresh = token ? isTokenNearExpiration(token) : false;

    if (shouldForceRefresh) {
      token = user ? await user.getIdToken(true) : null;
    }


  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return lastValueFrom(next(req));
} 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Add bearer token to request headers going to the api
  if (req.url.startsWith(environment.apiBaseUrl)) {
    return from(addBearerToken(req, next));
  }
  else {
    return next(req);
  }
};
