import { Routes } from '@angular/router';
import { DesignHomeComponent } from './design/design-home/design-home.component';

export const routes: Routes = [
    // ---------- design ----------
    {
        path: 'design',
        component: DesignHomeComponent,
        children: []
    },
    
];
