import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPractitionerComponent } from './card-practitioner.component';

describe('CardPractitionerComponent', () => {
  let component: CardPractitionerComponent;
  let fixture: ComponentFixture<CardPractitionerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardPractitionerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPractitionerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
