import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-import-data-home',
  standalone: true,
  imports: [],
  templateUrl: './import-data-home.component.html',
  styleUrl: './import-data-home.component.scss'
})
export class ImportDataHomeComponent {
  @Input() tableMetaId: string = '';
  @Input() importType: 'csv' | null = null;

  constructor() { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableMetaId']) {
      console.log('tableMetaId changed', changes['tableMetaId'].currentValue);
    }

    if (changes['importType']) {
      console.log('importType changed', changes['importType'].currentValue);
    }
    
  }


}
