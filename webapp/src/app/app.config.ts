import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './services/auth.service';

function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (req.url.endsWith('/register/')) {
    // If it is a registration request, skip the interceptor logic
    return next(req);
  }

  const authToken = inject(AuthService).getToken();

  // Clone the request to add the authentication header.
  const headers = req.headers.append('Authorization', `Bearer ${authToken}`);
  const authReq = req.clone({ headers });

  return next(authReq);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
