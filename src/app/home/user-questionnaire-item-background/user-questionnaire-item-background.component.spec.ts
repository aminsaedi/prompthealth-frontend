import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuestionnaireItemBackgroundComponent } from './user-questionnaire-item-background.component';

describe('UserQuestionnaireItemBackgroundComponent', () => {
  let component: UserQuestionnaireItemBackgroundComponent;
  let fixture: ComponentFixture<UserQuestionnaireItemBackgroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserQuestionnaireItemBackgroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQuestionnaireItemBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
