import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, PLATFORM_ID, signal, Signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { UserInterface, UserLoginInteface, UserRegisterInteface } from '../interfaces/main-interface';
import { isPlatformBrowser } from '@angular/common';
import { UtilService } from './util.service';
import { JwtService } from './jwt.service';
import { Auth, browserLocalPersistence, idToken, setPersistence, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { getAuth, sendEmailVerification } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  idTokenSignal = signal<string | null>(null);
  currentUserSignal = signal<{id: string, username: string}>({id: '', username: ''});

  constructor(
    private http: HttpClient,
    private utilService: UtilService,
    private jwtService: JwtService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  setIdToken() {
    const auth = getAuth()
    auth.currentUser?.getIdToken(true)
      .then((token) => {
        this.idTokenSignal.set(token);
    });
  }
    
  signup(user: UserRegisterInteface): Observable<UserInterface> {
    return this.http.post<UserInterface>(`${environment.apiUrl}/user/register/`, user)
  }

  sendVerificationEmail() {
    const auth = getAuth();
    sendEmailVerification(auth.currentUser!)
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.firebaseAuth, email, password)
  }

  logout(): void {

  }  
}
