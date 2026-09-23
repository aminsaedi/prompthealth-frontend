import { Component, OnInit , OnDestroy } from "@angular/core";
import { GetOnlineAcademyQuery } from "src/app/models/get-online-academy-query";
import { IGetPressReleasesResult } from "src/app/models/response-data";
import { SocialArticle } from "src/app/models/social-article";
import { ISocialPost } from "src/app/models/social-post";
import { SharedService } from "src/app/shared/services/shared.service";
import { UniversalService } from "src/app/shared/services/universal.service";
import { environment } from "src/environments/environment";
import { SortItem } from "src/app/buttons/button-sort/button-sort.component";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: "app-online-academy",
  templateUrl: "./online-academy.component.html",
  styleUrls: ["./online-academy.component.scss"],
})
export class OnlineAcademyComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();

  public latest: ISocialPost[] = null;
  public postTotal: number;
  public selectedCategory: string = "all";

  private selectedSort: SortItem = {
    id: "createdAtAsc",
    label: "Latest",
    type: "number",
    order: "desc",
    sortBy: "createdAt",
  };

  public sortItems: SortItem[] = [
    {
      id: "createdAtAsc",
      label: "Latest",
      type: "number",
      order: "desc",
      sortBy: "createdAt",
    },
    {
      id: "createdAtDesc",
      label: "Oldest",
      type: "number",
      order: "asc",
      sortBy: "createdAt",
    },
  ];

  public s3 = environment.config.AWS_S3;

  get browserS() {
    return this._uService.isServer || window?.innerWidth < 768;
  }

  get getSelectedCategory() {
    return this.selectedCategory;
  }

  onChangeSort(item: SortItem) {
    this.selectedSort = item;
    this.fetchLatest();
  }

  constructor(
    private _sharedService: SharedService,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    /* A literal path, so a query string can never reach the canonical. The
     * title used to be a copy of /press-release's ("News and press"), so the
     * two pages competed for one title, and the description credited "top
     * practitioners" for guides that are all by PromptHealth. */
    this._uService.setMeta("/online-academy", {
      title: "Prompt Academy, Free Social Media Guides | PromptHealth",
      description: "Free video guides from PromptHealth on social media, content and marketing, made for health and wellness practitioners.",
      robots: "index, follow",
    });

    this.fetchLatest();
  }

  changeCategory(category: string) {
    this.selectedCategory = category;
    this.fetchLatest();
  }

  fetchLatest() {
    const query = new GetOnlineAcademyQuery({
      /* The academy is a closed set: 55 guides, the newest from 2022-06, and
       * the editor's academy controls are commented out. The page has no
       * pager, so the API's default of 20 hid the older 35 under "All". Ask
       * for all of them in one request. */
      count: 100,
      ...(this.selectedCategory !== "all"
        ? { category: this.selectedCategory }
        : {}),
      order: this.selectedSort.order === "asc" ? 1 : -1,
    });
    this._sharedService
      .getNoAuth("note/get-academy" + query.toQueryParamsString())
      .pipe(takeUntil(this.destroy$)).subscribe((res: IGetPressReleasesResult) => {
        if (res.statusCode == 200) {
          this.latest = res.data.data.map((item) => new SocialArticle(item));
          this.postTotal = res.data.total;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
