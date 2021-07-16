import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemPostComponent } from './card-item-post.component';

describe('CardItemPostComponent', () => {
  let component: CardItemPostComponent;
  let fixture: ComponentFixture<CardItemPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardItemPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardItemPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
