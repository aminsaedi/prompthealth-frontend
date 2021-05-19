import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDropdownSliderComponent } from './filter-dropdown-slider.component';

describe('FilterDropdownSliderComponent', () => {
  let component: FilterDropdownSliderComponent;
  let fixture: ComponentFixture<FilterDropdownSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterDropdownSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDropdownSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
