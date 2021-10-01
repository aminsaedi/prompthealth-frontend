import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemNoteComponent } from './card-item-note.component';

describe('CardItemNoteComponent', () => {
  let component: CardItemNoteComponent;
  let fixture: ComponentFixture<CardItemNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardItemNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardItemNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
