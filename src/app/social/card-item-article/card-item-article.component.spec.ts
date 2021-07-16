import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemArticleComponent } from './card-item-article.component';

describe('CardItemArticleComponent', () => {
  let component: CardItemArticleComponent;
  let fixture: ComponentFixture<CardItemArticleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardItemArticleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardItemArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
