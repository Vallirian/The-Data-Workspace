import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UtilService } from '../../services/util.service';
import { CommonModule } from '@angular/common';
import { ProfilePictureComponent } from '../../components/profile-picture/profile-picture.component';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationInterface, TableListInterface } from '../../interfaces/main-interface';
import { NotificationService } from '../../services/notification.service';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-design-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    ProfilePictureComponent,
  ],
  templateUrl: './design-home.component.html',
  styleUrl: './design-home.component.scss'
})
export class DesignHomeComponent {
  greeing: string = 'Hello'
  notifications: NotificationInterface[] = [];

  newTableName: string | null = null
  tablesList: string[] = [];


  constructor(
    private utilService: UtilService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.greeing = utilService.getGreeting();
  }

  ngOnInit(): void {
    this.apiService.listTables().subscribe({
      next: (tables: string[]) => {
        this.tablesList = tables;
      },
      error: (err) => {
        this.notificationService.addNotification({message: err, type: 'error', dismissed: false, remainingTime: 5000});
      }
    });

  }

  // table 
  createTable() {
    if (!this.newTableName || this.newTableName.trim() === '') {
      this.notificationService.addNotification({message: 'Table name cannot be empty', type: 'error', dismissed: false, remainingTime: 5000});
      return;
    }
    
    this.apiService.createTable(this.newTableName).subscribe({
      next: (newTable: string) => {
        this.tablesList.push(newTable);
        this.newTableName = null;
        this.notificationService.addNotification({message: 'Table created successfully', type: 'success', dismissed: false, remainingTime: 5000});
      },
      error: (err) => {
        console.log(err);
        this.notificationService.addNotification({message: err.error.error, type: 'error', dismissed: false, remainingTime: 5000});
      }
    });
  }

  navigateToTable(tableId: string) {
    this.router.navigate([`/table/${tableId}`]);
  }

  get userName() {
    return String(this.authService.currentUser()?.username);
  }
}
