import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemHeaderComponent } from './card-item-header.component';

describe('CardItemHeaderComponent', () => {
  let component: CardItemHeaderComponent;
  let fixture: ComponentFixture<CardItemHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardItemHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardItemHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
