import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeVerifiedComponent } from './badge-verified.component';

describe('BadgeVerifiedComponent', () => {
  let component: BadgeVerifiedComponent;
  let fixture: ComponentFixture<BadgeVerifiedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgeVerifiedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeVerifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
