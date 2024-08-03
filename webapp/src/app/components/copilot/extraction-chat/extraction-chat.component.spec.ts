import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractionChatComponent } from './extraction-chat.component';

describe('ExtractionChatComponent', () => {
  let component: ExtractionChatComponent;
  let fixture: ComponentFixture<ExtractionChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtractionChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExtractionChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
