import { Routes } from '@angular/router';
import { SignupComponent } from './general/user/signup/signup.component';
import { HomeComponent } from './workbook/home/home.component';

export const routes: Routes = [
    {path: 'login-or-signup', component: SignupComponent, pathMatch: 'full'},
    {path: 'home', component: HomeComponent, pathMatch: 'full'}
];
