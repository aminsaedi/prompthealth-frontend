import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuestionaireComponent } from './user-questionaire.component';

describe('UserQuestionaireComponent', () => {
  let component: UserQuestionaireComponent;
  let fixture: ComponentFixture<UserQuestionaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserQuestionaireComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQuestionaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
