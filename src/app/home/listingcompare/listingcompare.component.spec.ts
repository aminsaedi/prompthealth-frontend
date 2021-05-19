import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ListingcompareComponent } from "./listingcompare.component";

describe("QuestionnaireComponent", () => {
  let component: ListingcompareComponent;
  let fixture: ComponentFixture<ListingcompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListingcompareComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingcompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
