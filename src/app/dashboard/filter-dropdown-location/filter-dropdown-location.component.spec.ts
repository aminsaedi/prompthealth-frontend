import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDropdownLocationComponent } from './filter-dropdown-location.component';

describe('FilterDropdownLocationComponent', () => {
  let component: FilterDropdownLocationComponent;
  let fixture: ComponentFixture<FilterDropdownLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterDropdownLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDropdownLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
