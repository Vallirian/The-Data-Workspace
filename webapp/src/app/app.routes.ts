import { Routes } from '@angular/router';
import { DesignHomeComponent } from './design/design-home/design-home.component';
import { SignupComponent } from './general/user/signup/signup.component';
import { LoginComponent } from './general/user/login/login.component';
import { WorkspaceHomeComponent } from './design/workspace/workspace-home/workspace-home.component';
import { EditTableComponent } from './design/table/edit-table/edit-table.component';

export const routes: Routes = [
    // ---------- design ----------
    {path: 'design', component: DesignHomeComponent, data: { title: 'Design Home', breadcrumb: null }},
    {path: 'design/workspace/:id', component: WorkspaceHomeComponent, data: { title: 'Workspace Home', breadcrumb: 'Workspace' }}, 
    {path: 'design/workspace/:id/table/:id', component: EditTableComponent, data: { title: 'Edit Table', breadcrumb: 'Table' }}, 

    {path: 'signup', component: SignupComponent, pathMatch: 'full'}, 
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
];
