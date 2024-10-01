import { Component, Input, input, Output, SimpleChanges } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { DataTableColumnMetaInterface, DataTableMetaInterface } from '../../interfaces/main';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
  @Input() workbookId: string | null = null;
  @Input() tableMetaId: string | null = null;

  // pagination
  itemsPerPage: number = 10;  
  totalItemsCount: number = 0;
  totalPages: number = 1;
  currentPage: number = 1;
  pages: number[] = [];  // Array of pages
  
  data: any[] = [];
  headers: DataTableColumnMetaInterface[] = [];
  tableMeta: DataTableMetaInterface | null = null;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workbookId'] && changes['workbookId'].currentValue) {
      this.workbookId = changes['workbookId'].currentValue;
    }

    if (changes['tableMetaId'] && changes['tableMetaId'].currentValue) {
      this.tableMetaId = changes['tableMetaId'].currentValue;
    }

    if (this.workbookId && this.tableMetaId) {
      this.fetchDataTable();
    }
  }

  fetchDataTable()  {
    if (!this.workbookId || !this.tableMetaId) {
      return;
    }

    this.apiService.getRawData(this.workbookId, this.tableMetaId, 1).subscribe(
      (data: any) => {
        this.data = data['items'];
        this.totalItemsCount = data['total_items_count'];
        this.currentPage = data['current_page'];
        this.itemsPerPage = data['page_size'];

        this.totalPages = Math.ceil(this.totalItemsCount / this.itemsPerPage);
        this.generatePages();

        // get table meta
        this.apiService.getDataTableMeta(this.workbookId!, this.tableMetaId!).subscribe(
          (tableMeta: DataTableMetaInterface) => {
            this.tableMeta = tableMeta;
          },
          (error) => {
            this.notificationService.addNotification({
              message: error.error.error || 'Failed to fetch table meta',
              type: 'error',
              dismissed: false,
              remainingTime: 5000
            });
          }
        );

        // get headers
        this.apiService.getDataTableColumnsMeta(this.workbookId!, this.tableMetaId!).subscribe(
          (headers: DataTableColumnMetaInterface[]) => {
            this.headers = headers;
          },
          (error) => {
            this.notificationService.addNotification({
              message: error.error.error || 'Failed to fetch table headers',
              type: 'error',
              dismissed: false,
              remainingTime: 5000
            });
          }
        );
      },
      (error) => {
        this.notificationService.addNotification({
          message: error.error.error || 'Failed to fetch raw data',
          type: 'error',
          dismissed: false,
          remainingTime: 5000
        });
      }
    );
  }
  
  generatePages() {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      
      if (!this.workbookId || !this.tableMetaId) {
        return;
      }

      this.apiService.getRawData(this.workbookId, this.tableMetaId, this.currentPage).subscribe(
        (data: any) => {
          this.data = data['items'];
          this.totalItemsCount = data['total_items_count'];
          this.currentPage = data['current_page'];
        },
        (error) => {
          this.notificationService.addNotification({
            message: error.error.error || 'Failed to fetch raw data',
            type: 'error',
            dismissed: false,
            remainingTime: 5000
          });
        }
      );
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }
}
