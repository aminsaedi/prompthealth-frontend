import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemSearchComponent } from './form-item-search.component';

describe('FormItemSearchComponent', () => {
  let component: FormItemSearchComponent;
  let fixture: ComponentFixture<FormItemSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
