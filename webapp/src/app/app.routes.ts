import { Routes } from '@angular/router';
import { DesignHomeComponent } from './design/design-home/design-home.component';
import { SignupComponent } from './general/user/signup/signup.component';
import { LoginComponent } from './general/user/login/login.component';
import { EditTableComponent } from './table/edit-table/edit-table.component';


export const routes: Routes = [
    // ---------- design ----------
    {path: 'home', component: DesignHomeComponent, data: { title: 'Design Home', breadcrumb: null }},
    {path: 'table/:id', component: EditTableComponent, data: { title: 'Edit Table', breadcrumb: 'Table' }}, 

    {path: 'signup', component: SignupComponent, pathMatch: 'full'}, 
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
];
