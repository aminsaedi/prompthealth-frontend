import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerTopComponent } from './banner-top.component';

describe('BannerTopComponent', () => {
  let component: BannerTopComponent;
  let fixture: ComponentFixture<BannerTopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BannerTopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
