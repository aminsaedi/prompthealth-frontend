import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineAcademyComponent } from './online-academy.component';

describe('OnlineAcademyComponent', () => {
  let component: OnlineAcademyComponent;
  let fixture: ComponentFixture<OnlineAcademyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineAcademyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineAcademyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
