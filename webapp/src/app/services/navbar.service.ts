import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  breadCrumb = signal<{label: string, navigationLink: string}[]>([])
  
  addBreadCrumb(breadCrumb: {label: string, navigationLink: string}) {
    this.breadCrumb.set([...this.breadCrumb(), breadCrumb]);
  }

  removeBreadCrumb() {
    const breadCrumb = this.breadCrumb();
    breadCrumb.pop();
    this.breadCrumb.set([...breadCrumb]);
  }
  
  constructor() { }
}
