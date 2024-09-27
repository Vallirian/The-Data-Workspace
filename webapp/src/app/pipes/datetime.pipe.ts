import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datetime',
  standalone: true
})
export class DatetimePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: string, format: string = 'medium', usageType: string = 'descriptive'): string | null {
    if (!value) {
      return null;
    }

    // Replace the space between date and time with 'T' to make it ISO 8601 compatible
    const isoDateString = value.replace(' ', 'T');
    const date = new Date(isoDateString);
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day

    // Reset the time part to compare only date parts
    const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const compareInputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Calculate the difference in days
    const diffDays = Math.floor((compareToday.getTime() - compareInputDate.getTime()) / oneDay);

    // Custom format without seconds
    const formatWithoutSeconds = format === 'medium' ? 'MMM d, y h:mm a' : format;

    if (usageType === 'title') {
      if (diffDays === 0) {
        return 'today';
      } else if (diffDays > 0 && diffDays <= 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else {
        // Use DatePipe to format the date more generically if beyond a week
        return this.datePipe.transform(date, 'mediumDate');
      }
    } else if (usageType === 'descriptive') {
      // Always return the exact date and time for descriptive usage, using format without seconds
      return this.datePipe.transform(date, formatWithoutSeconds);
    }
    return null;
  }

}
