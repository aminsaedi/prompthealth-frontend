import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalMatchGenderComponent } from './personal-match-gender.component';

describe('PersonalMatchGenderComponent', () => {
  let component: PersonalMatchGenderComponent;
  let fixture: ComponentFixture<PersonalMatchGenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalMatchGenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalMatchGenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
