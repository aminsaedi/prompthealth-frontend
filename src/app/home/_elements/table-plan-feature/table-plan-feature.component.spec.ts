import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePlanFeatureComponent } from './table-plan-feature.component';

describe('TablePlanFeatureComponent', () => {
  let component: TablePlanFeatureComponent;
  let fixture: ComponentFixture<TablePlanFeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablePlanFeatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablePlanFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
