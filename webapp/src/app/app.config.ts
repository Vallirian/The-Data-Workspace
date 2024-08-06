import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { catchError, switchMap } from 'rxjs';

function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (req.url.endsWith('/register/')) {
    // If it is a registration request, skip the interceptor logic
    return next(req);
  }

  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  let authToken = authService.getToken();

  if (authToken && authService.isTokenExpired()) {
    return authService.refreshToken().pipe(
      switchMap((token: string) => {
        authToken = token;
        authService.saveToken(token);

        // Clone the request to add the authentication header.
        const headers = req.headers.append('Authorization', `Bearer ${authToken}`);
        const authReq = req.clone({ headers });
        return next(authReq);
      }),
      catchError((err) => {
        notificationService.addNotification({ message: err.error.error || 'Failed to authenticate, please login again', type: 'error', dismissed: false, remainingTime: 5000 });
        // Optionally, you can also redirect the user to the login page here
        return next(req);
      })
    );
  } else {
    // Clone the request to add the authentication header.
    const headers = req.headers.append('Authorization', `Bearer ${authToken}`);
    const authReq = req.clone({ headers });
    return next(authReq);
  }
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