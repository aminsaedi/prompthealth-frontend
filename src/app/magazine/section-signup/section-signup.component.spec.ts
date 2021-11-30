import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionSignupComponent } from './section-signup.component';

describe('SectionSignupComponent', () => {
  let component: SectionSignupComponent;
  let fixture: ComponentFixture<SectionSignupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SectionSignupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
