import { Directive, Host, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumberOnly]',
  standalone: true
})
export class NumberOnlyDirective {

  constructor() { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow backspace, delete, tab, escape, enter, and arrow keys
    if (this.isSpecialKey(event)) {
      return;
    }

    // Prevent input if not a number
    if ((event.key < '0' || event.key > '9') && event.key !== '.') {
      event.preventDefault();
    }
  }

  private isSpecialKey(event: KeyboardEvent): boolean {
    const specialKeys: Array<string> = [
      'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Escape', 'Enter', 'Delete'
    ];
    return specialKeys.indexOf(event.key) !== -1 ||
           (event.key === 'a' && event.ctrlKey === true) || // Allow: Ctrl+A
           (event.key === 'c' && event.ctrlKey === true) || // Allow: Ctrl+C
           (event.key === 'v' && event.ctrlKey === true) || // Allow: Ctrl+V
           (event.key === 'x' && event.ctrlKey === true);   // Allow: Ctrl+X
  }

}
