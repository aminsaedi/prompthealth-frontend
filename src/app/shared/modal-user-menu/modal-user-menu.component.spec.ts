import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUserMenuComponent } from './modal-user-menu.component';

describe('ModalUserMenuComponent', () => {
  let component: ModalUserMenuComponent;
  let fixture: ComponentFixture<ModalUserMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalUserMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalUserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
