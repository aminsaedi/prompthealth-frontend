import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemEyecatchComponent } from './card-item-eyecatch.component';

describe('CardItemEyecatchComponent', () => {
  let component: CardItemEyecatchComponent;
  let fixture: ComponentFixture<CardItemEyecatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardItemEyecatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardItemEyecatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
