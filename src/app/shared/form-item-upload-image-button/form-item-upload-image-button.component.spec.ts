import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemUploadImageButtonComponent } from './form-item-upload-image-button.component';

describe('FormItemUploadImageButtonComponent', () => {
  let component: FormItemUploadImageButtonComponent;
  let fixture: ComponentFixture<FormItemUploadImageButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemUploadImageButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemUploadImageButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
