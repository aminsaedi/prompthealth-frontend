import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemPlaceComponent } from './form-item-place.component';

describe('FormItemPlaceComponent', () => {
  let component: FormItemPlaceComponent;
  let fixture: ComponentFixture<FormItemPlaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemPlaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemPlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
