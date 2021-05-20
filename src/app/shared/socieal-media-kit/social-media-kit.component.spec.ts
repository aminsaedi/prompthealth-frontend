import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaKitComponent } from './social-media-kit.component';

describe('SocialMediaKitComponent', () => {
  let component: SocialMediaKitComponent;
  let fixture: ComponentFixture<SocialMediaKitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialMediaKitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialMediaKitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
