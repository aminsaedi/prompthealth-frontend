import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuSmComponent } from './menu-sm.component';

describe('MenuSmComponent', () => {
  let component: MenuSmComponent;
  let fixture: ComponentFixture<MenuSmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuSmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuSmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
