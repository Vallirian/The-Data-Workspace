import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-workbook',
  standalone: true,
  imports: [],
  templateUrl: './edit-workbook.component.html',
  styleUrl: './edit-workbook.component.scss'
})
export class EditWorkbookComponent {
  workbookId: string = '';

  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.workbookId = this.activatedRoute.snapshot.params['id'];
  }
}
