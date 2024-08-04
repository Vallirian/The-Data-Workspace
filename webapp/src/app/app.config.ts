import { ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';


import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (req.url.endsWith('/register/')) {
    // If it is a registration request, skip the interceptor logic
    return next(req);
  }

  const authService = inject(AuthService);
  if (authService.idTokenSignal() === null) { // temporary fix
    authService.setIdToken();
  }
  const authToken = authService.idTokenSignal();
 

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
    ),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideAuth(() => getAuth())
    ])
  ]
};
