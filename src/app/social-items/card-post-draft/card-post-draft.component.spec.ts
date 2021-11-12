import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPostDraftComponent } from './card-post-draft.component';

describe('CardPostDraftComponent', () => {
  let component: CardPostDraftComponent;
  let fixture: ComponentFixture<CardPostDraftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardPostDraftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPostDraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
