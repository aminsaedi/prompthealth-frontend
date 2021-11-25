import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionSheetOpenAppComponent } from './action-sheet-open-app.component';

describe('ActionSheetOpenAppComponent', () => {
  let component: ActionSheetOpenAppComponent;
  let fixture: ComponentFixture<ActionSheetOpenAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionSheetOpenAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionSheetOpenAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
