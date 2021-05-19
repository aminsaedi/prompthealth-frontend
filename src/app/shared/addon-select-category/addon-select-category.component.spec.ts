import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddonSelectCategoryComponent } from './addon-select-category.component';

describe('AddonSelectCategoryComponent', () => {
  let component: AddonSelectCategoryComponent;
  let fixture: ComponentFixture<AddonSelectCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddonSelectCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddonSelectCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
