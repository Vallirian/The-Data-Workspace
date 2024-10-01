import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWorkbookComponent } from './edit-workbook.component';

describe('EditWorkbookComponent', () => {
  let component: EditWorkbookComponent;
  let fixture: ComponentFixture<EditWorkbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditWorkbookComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditWorkbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
