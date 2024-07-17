import { Component, Input } from '@angular/core';
import { ColumnListInterface } from '../../interfaces/main-interface';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() columns: ColumnListInterface[] = [];
  @Input() tableName: string = '';
  @Input() tableDescription: string = '';
  @Input() hasSearch: boolean = false;
  @Input() hasPagination: boolean = false;
  @Input() hasSort: boolean = false;
  @Input() hasFilter: boolean = false;
  @Input() hasExport: boolean = false;
  
}
