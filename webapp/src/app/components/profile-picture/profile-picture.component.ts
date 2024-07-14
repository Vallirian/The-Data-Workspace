import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [],
  templateUrl: './profile-picture.component.html',
  styleUrl: './profile-picture.component.scss'
})
export class ProfilePictureComponent {
  @Input() name: string = '';
  initial: string = '';
  backgroundColor: string = '';

  // Define a limited array of colors
  private colorPalette: string[] = [
    '#FFA6C9', // Bold pastel pink
    '#E7A9FE', // Bold pastel purple
    '#A7E3EB', // Bold pastel sky blue
    // '#FFFF99', // Bold pastel lemon
    // '#98FFCC', // Bold pastel mint
    // '#FFCC99', // Bold pastel peach
    '#CCCCCC', // Bold pastel gray
    '#FFB280', // Bold pastel orange
    '#B6D7A8', // Bold pastel green
    '#EA9999'  // Bold pastel red
  ];

  ngOnInit(): void {
    this.initial = this.name ? this.name[0].toUpperCase() : '';
    this.backgroundColor = this.getRandomColor(); // Set a random color from the palette
  }

  getRandomColor(): string {
    // Randomly pick a color from the predefined color palette
    return this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
  }
}
