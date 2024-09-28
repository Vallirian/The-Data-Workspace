import { Routes } from '@angular/router';
import { SignupComponent } from './general/user/signup/signup.component';
import { HomeComponent } from './workbook/home/home.component';
import { EditWorkbookComponent } from './workbook/edit-workbook/edit-workbook.component';

export const routes: Routes = [
    {path: 'workbook/:id', component: EditWorkbookComponent},
    {path: 'workbooks', component: HomeComponent},
    
    
    {path: 'login-or-signup', component: SignupComponent},

    {path: '', redirectTo: '/workbooks', pathMatch: 'full'},
];
