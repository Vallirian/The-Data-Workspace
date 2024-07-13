import { Routes } from '@angular/router';
import { DesignHomeComponent } from './design/design-home/design-home.component';
import { SignupComponent } from './general/user/signup/signup.component';
import { LoginComponent } from './general/user/login/login.component';

export const routes: Routes = [
    // ---------- design ----------
    {
        path: 'design',
        component: DesignHomeComponent,
        children: []
    },
    {path: 'signup', component: SignupComponent, pathMatch: 'full'}, 
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
];
