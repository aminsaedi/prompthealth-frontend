import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { GetOnlineAcademyQuery } from "src/app/models/get-online-academy-query";
import { IGetPressReleasesResult } from "src/app/models/response-data";
import { SocialArticle } from "src/app/models/social-article";
import { ISocialPost } from "src/app/models/social-post";
import { SharedService } from "src/app/shared/services/shared.service";
import { UniversalService } from "src/app/shared/services/universal.service";
import { validators } from "src/app/_helpers/form-settings";
import { environment } from "src/environments/environment";
import { ProfileManagementService } from "../../shared/services/profile-management.service";
import { ModalService } from "../../shared/services/modal.service";
import { SortItem } from "src/app/buttons/button-sort/button-sort.component";
@Component({
  selector: "app-online-academy",
  templateUrl: "./online-academy.component.html",
  styleUrls: ["./online-academy.component.scss"],
})
export class OnlineAcademyComponent implements OnInit {
  public latest: ISocialPost[] = null;
  public archives: ISocialPost[];
  public pageCurrent: number = 1;
  public paginators: number[][] = null;
  public pageTotal: number;
  public postTotal: number;
  public selectedCategory: string = "all";
  public onlyShowFreeContent: boolean = false;

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

  private form: FormGroup;

  get f() {
    return this.form.controls;
  }

  get browserS() {
    return this._uService.isServer || window?.innerWidth < 768;
  }

  get getSelectedCategory() {
    return this.selectedCategory;
  }

  get user() {
    return this._profileService.profile;
  }

  onClickPost(post: ISocialPost) {
    if (post.isFreeAcademy) {
      const link = ["/community", "content", post._id];
      this._router.navigate(link);
      return;
    } else {
      if (this.user?.isEligibleToSeePremiumAcademy) {
        const link = ["/community", "content", post._id];
        this._router.navigate(link);
      }
      if (!this.user) {
        // Please Login And Register as provider premium
        this._modalService.show("upgrade-plan-with-out-user");
      }
      if (this.user && !this.user?.isEligibleToSeePremiumAcademy) {
        this._modalService.show("upgrade-plan-with-user");
      }
    }
  }

  onChangeSort(item: SortItem) {
    this.selectedSort = item;
    this.fetchLatest();
    console.log(item.order);
  }

  paginatorShown(page: number) {
    if (!this.paginators || this.paginators.length == 0) {
      return false;
    } else if (page <= 2 || page >= this.paginators.length - 1) {
      return true;
    } else {
      const dist =
        this.pageCurrent == 1 || this.pageCurrent == this.paginators.length
          ? 2
          : 1;
      if (Math.abs(page - this.pageCurrent) > dist) {
        return false;
      } else {
        return true;
      }
    }
  }
  constructor(
    private _router: Router,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _toastr: ToastrService,
    private _profileService: ProfileManagementService,
    private _modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      onlyFreeContent: new FormControl("onlyFreeContent"),
      // types: new FormControl("types"),
    });

    this._uService.setMeta(this._router.url, {
      title: "News and press | PromptHealth",
      description: "Find latest news from PromptHealth",
      robots: "index, follow",
    });

    this.fetchLatest();
  }

  changeCategory(category: string) {
    this.selectedCategory = category;
    this.fetchLatest();
  }

  onChangeOnlyFree() {
    this.onlyShowFreeContent = !this.onlyShowFreeContent;
    this.fetchLatest();
  }

  fetchLatest() {
    const query = new GetOnlineAcademyQuery({
      // count: 4,
      // skip: 0,
      ...(this.selectedCategory !== "all"
        ? { category: this.selectedCategory }
        : {}),
      order: this.selectedSort.order === "asc" ? 1 : -1,
      onlyFreeAcademy: this.onlyShowFreeContent

    });
    this._sharedService
      .getNoAuth("note/get-academy" + query.toQueryParamsString())
      .subscribe((res: IGetPressReleasesResult) => {
        if (res.statusCode == 200) {
          this.latest = res.data.data.map((item) => new SocialArticle(item));
          this.postTotal = res.data.total;
        }
      });
  }

  setPaginators() {
    if (!this.pageTotal || this.pageTotal <= 1) {
      this.paginators = null;
    } else {
      const paginators: { page: number; shown: boolean }[] = [];
      for (let i = 1; i <= this.pageTotal; i++) {
        let shown = false;
        if (i == 1 || i == this.pageTotal) {
          shown = true;
        } else {
          const dist =
            this.pageCurrent == 1 || this.pageCurrent == this.pageTotal ? 2 : 1;
          if (Math.abs(i - this.pageCurrent) > dist) {
            shown = false;
          } else {
            shown = true;
          }
        }

        paginators.push({
          page: i,
          shown: shown,
        });
      }

      this.paginators = [[]];
      paginators.forEach((p) => {
        if (p.shown) {
          this.paginators[this.paginators.length - 1].push(p.page);
        } else {
          if (this.paginators[this.paginators.length - 1].length > 0) {
            this.paginators.push([]);
          }
        }
      });
    }
  }
}
