import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

const addBearerToken = async(req: HttpRequest<any>, next: HttpHandlerFn): Promise<HttpEvent<any>> => {
  const firebaseAuth = inject(Auth);
  const user = await firebaseAuth.currentUser;
  const token = user ? await user.getIdToken() : null;

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
