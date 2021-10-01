import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSubscribeComponent } from './card-subscribe.component';

describe('CardSubscribeComponent', () => {
  let component: CardSubscribeComponent;
  let fixture: ComponentFixture<CardSubscribeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardSubscribeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardSubscribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
