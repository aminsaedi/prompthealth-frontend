import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemHeaderEventComponent } from './card-item-header-event.component';

describe('CardItemHeaderEventComponent', () => {
  let component: CardItemHeaderEventComponent;
  let fixture: ComponentFixture<CardItemHeaderEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardItemHeaderEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardItemHeaderEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
