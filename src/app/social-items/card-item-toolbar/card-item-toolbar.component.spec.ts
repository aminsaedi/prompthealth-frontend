import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemToolbarComponent } from './card-item-toolbar.component';

describe('CardItemToolbarComponent', () => {
  let component: CardItemToolbarComponent;
  let fixture: ComponentFixture<CardItemToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardItemToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardItemToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
