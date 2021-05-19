import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDropdownSelectComponent } from './filter-dropdown-select.component';

describe('FilterDropdownRadioboxComponent', () => {
  let component: FilterDropdownSelectComponent;
  let fixture: ComponentFixture<FilterDropdownSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterDropdownSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDropdownSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
