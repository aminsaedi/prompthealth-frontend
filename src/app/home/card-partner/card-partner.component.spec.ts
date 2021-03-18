import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPartnerComponent } from './card-partner.component';

describe('CardPartnerComponent', () => {
  let component: CardPartnerComponent;
  let fixture: ComponentFixture<CardPartnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardPartnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
