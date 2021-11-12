import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemEventComponent } from './card-item-event.component';

describe('CardItemEventComponent', () => {
  let component: CardItemEventComponent;
  let fixture: ComponentFixture<CardItemEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardItemEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardItemEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
