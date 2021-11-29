import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalMatchAgeComponent } from './personal-match-age.component';

describe('UserQuestionnaireItemSelectComponent', () => {
  let component: PersonalMatchAgeComponent;
  let fixture: ComponentFixture<PersonalMatchAgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalMatchAgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalMatchAgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
