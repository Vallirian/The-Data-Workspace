import { Routes } from '@angular/router';
import { SignupComponent } from './general/user/signup/signup.component';
import { HomeComponent } from './workbook/home/home.component';
import { EditWorkbookComponent } from './workbook/edit-workbook/edit-workbook.component';

export const routes: Routes = [
    {path: 'login-or-signup', component: SignupComponent},
    {path: 'workbooks', component: HomeComponent},
    {path: 'workbooks/:id', component: EditWorkbookComponent}
];
