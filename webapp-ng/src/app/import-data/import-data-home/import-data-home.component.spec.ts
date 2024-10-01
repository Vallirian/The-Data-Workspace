import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDataHomeComponent } from './import-data-home.component';

describe('ImportDataHomeComponent', () => {
  let component: ImportDataHomeComponent;
  let fixture: ComponentFixture<ImportDataHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportDataHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImportDataHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
