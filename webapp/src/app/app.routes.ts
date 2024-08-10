import { Routes } from '@angular/router';
import { SignupComponent } from './general/user/signup/signup.component';
import { LoginComponent } from './general/user/login/login.component';
import { EditTableComponent } from './workspace/edit-table/edit-table.component';
import { ProcessComponent } from './general/process/process.component';
import { WorkspaceHomeComponent } from './workspace/workspace-home/workspace-home.component';
import { ErrorPageComponent } from './general/error-page/error-page.component';
import { SettingsComponent } from './general/user/settings/settings.component';


export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' }, 
    {path: 'home', component: WorkspaceHomeComponent, data: { title: 'Workspace Home', breadcrumb: null }},
    {path: 'process', component: ProcessComponent, data: { title: 'Processes', breadcrumb: null }},
    {path: 'table/:id', component: EditTableComponent, data: { title: 'Edit Table', breadcrumb: 'Table' }}, 

    {path: 'signup', component: SignupComponent, pathMatch: 'full'}, 
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
    {path: 'settings', component: SettingsComponent, pathMatch: 'full'},

    // Handle all other routes
    { path: '**', component: ErrorPageComponent, data: { title: 'Page Not Found' }} // Wildcard route for a 404 page
];
