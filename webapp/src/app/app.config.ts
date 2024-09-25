import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environment.development';
import { HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom([
      provideFirebaseApp( () => initializeApp(environment.firebaseConfig) ),
      provideAuth( () => getAuth())
    ]),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
