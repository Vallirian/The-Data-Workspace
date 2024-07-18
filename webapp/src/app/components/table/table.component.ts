import { Component, Input } from '@angular/core';
import { ColumnListInterface } from '../../interfaces/main-interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() columns: ColumnListInterface[] = [];
  @Input() rowData: any[] = [];
  @Input() tableName: string = '';
  @Input() tableDescription: string = '';
  @Input() hasSearch: boolean = false;
  @Input() hasPagination: boolean = false;
  @Input() hasSort: boolean = false;
  @Input() hasFilter: boolean = false;
  @Input() hasExport: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // demo
    // this.tableName = 'User Table';
    // this.tableDescription = 'This table shows the list of users';
    // this.columns = [
    //   {
    //     id: '1',
    //     displayName: 'Name',
    //     description: 'Name of the user',
    //     type: 'string'
    //   },
    //   {
    //     id: '2',
    //     displayName: 'Age',
    //     description: 'Age of the user',
    //     type: 'number'
    //   },
    //   {
    //     id: '3',
    //     displayName: 'Date of Birth',
    //     description: 'Date of Birth of the user',
    //     type: 'date'
    //   },
    //   {
    //     id: '4',
    //     displayName: 'Is Active',
    //     description: 'Is user active',
    //     type: 'boolean'
    //   },
    //   {
    //     id: '5',
    //     displayName: 'Actions',
    //     description: 'Event of user actions',
    //     type: 'string'
    //   },
    //   {
    //     id: '6',
    //     displayName: 'Actions',
    //     description: 'Event of user actions',
    //     type: 'string'
    //   },
    //   {
    //     id: '7',
    //     displayName: 'Actions',
    //     description: 'Event of user actions',
    //     type: 'string'
    //   }
    // ];
    // this.rowData = [
    //   {
    //     '1': 'John Doe',
    //     '2': 25,
    //     '3': '1996-01-01',
    //     '4': true,
    //     '5': 'Edit',
    //     '6': 'Delete',
    //     '7': 'View'
    //   },
    //   {
    //     '1': 'Jane Doe',
    //     '2': 22,
    //     '3': '1999-01-01',
    //     '4': false,
    //     '5': 'Edit',
    //     '6': 'Delete',
    //     '7': 'View'
    //   },
    //   {
    //     '1': 'John Doe',
    //     '2': 25,
    //     '3': '1996-01-01',
    //     '4': true,
    //     '5': 'Edit',
    //     '6': 'Delete',
    //     '7': 'View'
    //   },
    //   {
    //     '1': 'Jane Doe',
    //     '2': 22,
    //     '3': '1999-01-01',
    //     '4': false,
    //     '5': 'Edit',
    //     '6': 'Delete',
    //     '7': 'View'
    //   },
    //   {
    //     '1': 'John Doe',
    //     '2': 25,
    //     '3': '1996-01-01',
    //     '4': true,
    //     '5': 'Edit',
    //     '6': 'Delete',
    //     '7': 'View'
    //   },
    //   {
    //     '1': 'Jane Doe',
    //     '2': 22,
    //     '3': '1999-01-01',
    //     '4': false,
    //     '5': 'Edit',
    //     '6': 'Delete',
    //     '7': 'View'
    //   },
    //   {
    //     '1': 'John Doe',
    //     '2': 25,
    //     '3': '1996-01-01',
    //     '4': true,
    //     '5': 'Edit',
    //     '6': 'Delete',
    //     '7': 'View'
    //   },
    //   {
    //     '1': 'Jane Doe',
    //     '2': 22,
    //     '3': '1999-01-01',
    //     '4': false,
    //     '5': 'Edit',
    //     '6': 'Delete',
    //     '7': 'View'
    //   },
    // ];
  }
  
}
