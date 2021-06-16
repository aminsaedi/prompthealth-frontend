import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderMagazineComponent } from './header-magazine.component';

describe('HeaderMagazineComponent', () => {
  let component: HeaderMagazineComponent;
  let fixture: ComponentFixture<HeaderMagazineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderMagazineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderMagazineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
