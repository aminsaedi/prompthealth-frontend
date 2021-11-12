import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPostMenuComponent } from './popup-post-menu.component';

describe('PopupPostMenuComponent', () => {
  let component: PopupPostMenuComponent;
  let fixture: ComponentFixture<PopupPostMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupPostMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupPostMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
