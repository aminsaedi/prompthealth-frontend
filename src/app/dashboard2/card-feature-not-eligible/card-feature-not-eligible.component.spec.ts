import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFeatureNotEligibleComponent } from './card-feature-not-eligible.component';

describe('CardFeatureNotEligibleComponent', () => {
  let component: CardFeatureNotEligibleComponent;
  let fixture: ComponentFixture<CardFeatureNotEligibleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardFeatureNotEligibleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardFeatureNotEligibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
