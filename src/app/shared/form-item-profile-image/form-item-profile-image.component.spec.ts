import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemProfileImageComponent } from './form-item-profile-image.component';

describe('FormItemProfileImageComponent', () => {
  let component: FormItemProfileImageComponent;
  let fixture: ComponentFixture<FormItemProfileImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemProfileImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemProfileImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
