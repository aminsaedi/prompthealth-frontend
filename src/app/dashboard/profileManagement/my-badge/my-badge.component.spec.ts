import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBadgeComponent } from './my-badge.component';

describe('MyBadgeComponent', () => {
  let component: MyBadgeComponent;
  let fixture: ComponentFixture<MyBadgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyBadgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
