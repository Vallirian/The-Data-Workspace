import { Routes } from '@angular/router';
import { DesignHomeComponent } from './design/design-home/design-home.component';
import { SignupComponent } from './general/user/signup/signup.component';
import { LoginComponent } from './general/user/login/login.component';
import path from 'path';

export const routes: Routes = [
    // ---------- design ----------
    // {
    //     path: 'design',
    //     component: DesignHomeComponent,
    //     data: { title: 'Design Home', breadcrumb: null },
    //     children: [
            
    //     ]
    // },
    {path: 'signup', component: SignupComponent, pathMatch: 'full'}, 
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
    {path: 'test', component: DesignHomeComponent, pathMatch: 'full'},
];
