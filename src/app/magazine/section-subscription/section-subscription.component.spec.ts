import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionSubscriptionComponent } from './section-subscription.component';

describe('SectionSubscriptionComponent', () => {
  let component: SectionSubscriptionComponent;
  let fixture: ComponentFixture<SectionSubscriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SectionSubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
