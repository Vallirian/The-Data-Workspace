import { Routes } from '@angular/router';
import { DesignHomeComponent } from './design/design-home/design-home.component';
import { SignupComponent } from './general/user/signup/signup.component';
import { LoginComponent } from './general/user/login/login.component';
import { WorkspaceHomeComponent } from './design/workspace/workspace-home/workspace-home.component';

export const routes: Routes = [
    // ---------- design ----------
    {path: 'design', component: DesignHomeComponent, data: { title: 'Design Home', breadcrumb: null }},
    {path: 'design/workspace/:id', component: WorkspaceHomeComponent, data: { title: 'Workspace Home', breadcrumb: 'Workspace' }}, 

    {path: 'signup', component: SignupComponent, pathMatch: 'full'}, 
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
];
