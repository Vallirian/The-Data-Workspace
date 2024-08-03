import { Routes } from '@angular/router';
import { SignupComponent } from './general/user/signup/signup.component';
import { LoginComponent } from './general/user/login/login.component';
import { EditTableComponent } from './workspace/edit-table/edit-table.component';
import { ProcessComponent } from './general/process/process.component';
import { WorkspaceHomeComponent } from './workspace/workspace-home/workspace-home.component';


export const routes: Routes = [
    // ---------- design ----------
    {path: 'home', component: WorkspaceHomeComponent, data: { title: 'Workspace Home', breadcrumb: null }},
    {path: 'process', component: ProcessComponent, data: { title: 'Processes', breadcrumb: null }},
    {path: 'table/:id', component: EditTableComponent, data: { title: 'Edit Table', breadcrumb: 'Table' }}, 

    {path: 'signup', component: SignupComponent, pathMatch: 'full'}, 
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
];
