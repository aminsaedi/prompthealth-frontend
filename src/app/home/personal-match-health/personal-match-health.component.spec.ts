import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalMatchHealthComponent } from './personal-match-health.component';

describe('PersonalMatchHealthComponent', () => {
  let component: PersonalMatchHealthComponent;
  let fixture: ComponentFixture<PersonalMatchHealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalMatchHealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalMatchHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
