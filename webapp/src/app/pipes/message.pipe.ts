import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'message',
  standalone: true
})
export class MessagePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Replace **text** with <strong>text</strong>
    value = value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace * text with <li> text</li>
    value = value.replace(/\* (.*?)$/gm, '<li>$1</li>');

    // Wrap lists with <ul>
    value = value.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');

    // Convert new lines to <p> elements
    value = value.replace(/\n\n/g, '</p><p>');
    value = '<p>' + value + '</p>';
    return value;
  }

}
