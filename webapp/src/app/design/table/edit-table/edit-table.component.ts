import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-edit-table',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './edit-table.component.html',
  styleUrl: './edit-table.component.scss'
})
export class EditTableComponent {
  selectedSection: 'section-details' | 'section-columns' | 'section-automations' = 'section-details';

  constructor() { }
}
