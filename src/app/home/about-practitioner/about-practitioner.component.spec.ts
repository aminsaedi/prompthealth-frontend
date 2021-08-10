import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPractitionerComponent } from './about-practitioner.component';

describe('AboutPractitionerComponent', () => {
  let component: AboutPractitionerComponent;
  let fixture: ComponentFixture<AboutPractitionerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutPractitionerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutPractitionerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
