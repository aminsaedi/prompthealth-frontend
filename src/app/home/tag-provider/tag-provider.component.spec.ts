import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagProviderComponent } from './tag-provider.component';

describe('TagProviderComponent', () => {
  let component: TagProviderComponent;
  let fixture: ComponentFixture<TagProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
