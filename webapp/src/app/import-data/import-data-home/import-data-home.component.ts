import { Component, Input, SimpleChanges } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { DataTableColumnMetaInterface, DataTableMetaInterface } from '../../interfaces/main';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

@Component({
  selector: 'app-import-data-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-data-home.component.html',
  styleUrl: './import-data-home.component.scss'
})
export class ImportDataHomeComponent {
  @Input() workbookId: string | null = null;
  @Input() tableMetaId: string | null = null;
  @Input() importType: 'csv' | null = null;

  tableMetaData: DataTableMetaInterface | null = null;

  dataTypes = ['string', 'integer', 'float', 'date YYYY-MM-DD', 'date MM/DD/YYYY', 'date DD/MM/YYYY'];
  csvData: any[] = [];
  csvHeaders: DataTableColumnMetaInterface[] = [];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService 
  ) { }

  ngOnInit(): void {
    if (this.tableMetaId) {
      this.fetchTableMeta();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableMetaId']) {
     this.tableMetaId = changes['tableMetaId'].currentValue
      this.fetchTableMeta(); 
    }

    if (changes['workbookId']) {
      this.workbookId = changes['workbookId'].currentValue
    }

    if (changes['importType']) {
      this.importType = changes['importType'].currentValue
    }
    
  }

  fetchTableMeta(): void {
    if (!this.tableMetaId || !this.workbookId) {
      return
    }

   this.apiService.getDataTableMeta(this.workbookId, this.tableMetaId).subscribe(
      (data: DataTableMetaInterface) => {
        this.tableMetaData = data;
      },
      (error) => {
        this.notificationService.addNotification({
          message: error.error.error || 'Failed to fetch table meta data',
          type: 'error',
          dismissed: false,
          remainingTime: 5000
        });
      }
    );
  }

  // CSV Import
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csvContent = e.target.result;
        this.parseCsv(csvContent); 
      };
      reader.readAsText(file);

      if (this.tableMetaData) {
        this.tableMetaData.name = file.name.split('.')[0];
      }
    }
  }

  parseCsv(csvContent: string) {
    this.csvHeaders = [];
    try {
      const data = d3.csvParse(csvContent);
      this.csvData = data;
      Object.keys(data[0]).forEach((header) => {
        this.csvHeaders.push({
          id: header,
          name: header,
          dtype: 'string',
          format: '',
          description: ''
        });
      })
    } catch (error) {
      this.notificationService.addNotification({
        message: 'Failed to parse CSV file',
        type: 'error',
        dismissed: false,
        remainingTime: 5000
      });
    }
  }

  onChangeHeaderDataType(index: number, event: any) {
    const selectedValue = event.target.value; 
    const header = this.csvHeaders[index];
  
    // Check if the selected data type is a date
    if (selectedValue.startsWith('date')) {
      // Extract and set the date format from the selected value
      header.dtype = 'date';
      header.format = selectedValue.split(' ')[1]; // This extracts the date format (e.g., YYYY-MM-DD)
    } else {
      // For non-date types, just update the dtype and reset the format
      header.dtype = selectedValue;
      header.format = ''; // Clear the format if it's not a date
    }
      
  }



}
