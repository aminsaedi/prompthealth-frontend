import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertUploadingComponent } from './alert-uploading.component';

describe('AlertUploadingComponent', () => {
  let component: AlertUploadingComponent;
  let fixture: ComponentFixture<AlertUploadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertUploadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertUploadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
