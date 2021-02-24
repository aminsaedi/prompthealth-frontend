import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDropdownInputComponent } from './filter-dropdown-input.component';

describe('FilterDropdownInputComponent', () => {
  let component: FilterDropdownInputComponent;
  let fixture: ComponentFixture<FilterDropdownInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterDropdownInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDropdownInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
