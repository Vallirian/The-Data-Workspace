import { Routes } from '@angular/router';
import { SignupComponent } from './general/user/signup/signup.component';

export const routes: Routes = [
    {path: 'login-or-signup', component: SignupComponent, pathMatch: 'full'},
];
