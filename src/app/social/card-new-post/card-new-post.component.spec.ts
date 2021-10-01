import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardNewPostComponent } from './card-new-post.component';

describe('CardNewPostComponent', () => {
  let component: CardNewPostComponent;
  let fixture: ComponentFixture<CardNewPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardNewPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardNewPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
