import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerGeneralComponent } from './partner-general.component';

describe('PartnerGeneralComponent', () => {
  let component: PartnerGeneralComponent;
  let fixture: ComponentFixture<PartnerGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
