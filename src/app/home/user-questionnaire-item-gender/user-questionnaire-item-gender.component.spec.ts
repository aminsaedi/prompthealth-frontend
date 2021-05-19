import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuestionnaireItemGenderComponent } from './user-questionnaire-item-gender.component';

describe('UserQuestionnaireItemGenderComponent', () => {
  let component: UserQuestionnaireItemGenderComponent;
  let fixture: ComponentFixture<UserQuestionnaireItemGenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserQuestionnaireItemGenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQuestionnaireItemGenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
