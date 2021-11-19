import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertNotApprovedComponent } from './alert-not-approved.component';

describe('AlertNotApprovedComponent', () => {
  let component: AlertNotApprovedComponent;
  let fixture: ComponentFixture<AlertNotApprovedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertNotApprovedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertNotApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
