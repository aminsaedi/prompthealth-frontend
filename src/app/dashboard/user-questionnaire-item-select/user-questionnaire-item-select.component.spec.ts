import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuestionnaireItemSelectComponent } from './user-questionnaire-item-select.component';

describe('UserQuestionnaireItemSelectComponent', () => {
  let component: UserQuestionnaireItemSelectComponent;
  let fixture: ComponentFixture<UserQuestionnaireItemSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserQuestionnaireItemSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQuestionnaireItemSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
