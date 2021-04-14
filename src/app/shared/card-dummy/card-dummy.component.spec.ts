import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDummyComponent } from './card-dummy.component';

describe('CardDummyComponent', () => {
  let component: CardDummyComponent;
  let fixture: ComponentFixture<CardDummyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardDummyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardDummyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
