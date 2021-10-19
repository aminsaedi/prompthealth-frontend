import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardNewPromoComponent } from './card-new-promo.component';

describe('CardNewPromoComponent', () => {
  let component: CardNewPromoComponent;
  let fixture: ComponentFixture<CardNewPromoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardNewPromoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardNewPromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
