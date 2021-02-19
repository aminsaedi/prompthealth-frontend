import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmenityViewerComponent } from './amenity-viewer.component';

describe('AmenityViewerComponent', () => {
  let component: AmenityViewerComponent;
  let fixture: ComponentFixture<AmenityViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmenityViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmenityViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
