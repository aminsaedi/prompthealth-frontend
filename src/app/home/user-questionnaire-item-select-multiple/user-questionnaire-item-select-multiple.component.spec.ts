import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuestionnaireItemSelectMultipleComponent } from './user-questionnaire-item-select-multiple.component';

describe('UserQuestionnaireItemSelectMultipleComponent', () => {
  let component: UserQuestionnaireItemSelectMultipleComponent;
  let fixture: ComponentFixture<UserQuestionnaireItemSelectMultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserQuestionnaireItemSelectMultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQuestionnaireItemSelectMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
