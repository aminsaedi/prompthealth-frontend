import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemCommentComponent } from './card-item-comment.component';

describe('CardItemCommentComponent', () => {
  let component: CardItemCommentComponent;
  let fixture: ComponentFixture<CardItemCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardItemCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardItemCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
