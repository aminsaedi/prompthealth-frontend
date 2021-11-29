import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalMatchComponent } from './personal-match.component';

describe('PersonalMatchComponent', () => {
  let component: PersonalMatchComponent;
  let fixture: ComponentFixture<PersonalMatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalMatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
