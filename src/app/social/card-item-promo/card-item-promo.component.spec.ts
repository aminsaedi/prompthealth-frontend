import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemPromoComponent } from './card-item-promo.component';

describe('CardItemPromoComponent', () => {
  let component: CardItemPromoComponent;
  let fixture: ComponentFixture<CardItemPromoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardItemPromoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardItemPromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
