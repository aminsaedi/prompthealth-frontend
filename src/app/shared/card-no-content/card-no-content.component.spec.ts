import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardNoContentComponent } from './card-no-content.component';

describe('CardNoContentComponent', () => {
  let component: CardNoContentComponent;
  let fixture: ComponentFixture<CardNoContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardNoContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardNoContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
