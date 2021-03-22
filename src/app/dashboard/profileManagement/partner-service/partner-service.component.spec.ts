import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerServiceComponent } from './partner-service.component';

describe('PartnerServiceComponent', () => {
  let component: PartnerServiceComponent;
  let fixture: ComponentFixture<PartnerServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
