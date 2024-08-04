import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowToChatComponent } from './how-to-chat.component';

describe('HowToChatComponent', () => {
  let component: HowToChatComponent;
  let fixture: ComponentFixture<HowToChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowToChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HowToChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
