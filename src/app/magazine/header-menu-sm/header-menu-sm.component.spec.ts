import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderMenuSmComponent } from './header-menu-sm.component';

describe('HeaderMenuSmComponent', () => {
  let component: HeaderMenuSmComponent;
  let fixture: ComponentFixture<HeaderMenuSmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderMenuSmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderMenuSmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
