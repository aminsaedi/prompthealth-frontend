import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItemCommentComponent } from './form-item-comment.component';

describe('FormItemCommentComponent', () => {
  let component: FormItemCommentComponent;
  let fixture: ComponentFixture<FormItemCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormItemCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormItemCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
