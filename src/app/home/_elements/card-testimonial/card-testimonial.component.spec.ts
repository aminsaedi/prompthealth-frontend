import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTestimonialComponent } from './card-testimonial.component';

describe('CardTestimonialComponent', () => {
  let component: CardTestimonialComponent;
  let fixture: ComponentFixture<CardTestimonialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardTestimonialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardTestimonialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
