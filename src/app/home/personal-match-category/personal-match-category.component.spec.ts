import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalMatchCategoryComponent } from './personal-match-category.component';

describe('PersonalMatchCategoryComponent', () => {
  let component: PersonalMatchCategoryComponent;
  let fixture: ComponentFixture<PersonalMatchCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalMatchCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalMatchCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
