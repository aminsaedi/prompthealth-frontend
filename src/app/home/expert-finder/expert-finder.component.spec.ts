import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertFinderComponent } from './expert-finder.component';

describe('ExpertFinderComponent', () => {
  let component: ExpertFinderComponent;
  let fixture: ComponentFixture<ExpertFinderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpertFinderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpertFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
