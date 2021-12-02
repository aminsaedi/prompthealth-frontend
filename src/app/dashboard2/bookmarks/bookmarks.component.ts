import { Component, OnInit } from '@angular/core';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { GetQuery } from 'src/app/models/get-query';
import { IGetSocialContentsByAuthorResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.scss']
})
export class BookmarksComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get bookmarks(): ISocialPost[] { return this.user.bookmarks; }
  get currentPage(): number { return this.bookmarks ? Math.ceil(this.bookmarks.length / this.countPerPage) + 1 : 1; }

  public existsMore = true;
  public isLoading = false;

  private countPerPage = 20;

  constructor(
    private _sharedService: SharedService,
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    if(this.user.isBookmarksChanged) {
      this.user.disposeBookmarks();
    }

    if(!this.bookmarks) {
      this.fetchBookmarks();
    } else {
      this.existsMore = this.currentPage * this.countPerPage == this.bookmarks.length;
    }

    this._uService.setMeta(this._router.url, {
      title: 'My profile - bookmarks | PromptHealth',
    });
  }

  fetchBookmarks() {
    const query = new GetQuery({ page: this.currentPage, count: this.countPerPage });

    this.isLoading = true;
    this._sharedService.get('social/get-bookmarks' + query.toQueryParamsString()).subscribe((res: IGetSocialContentsByAuthorResult) => {
      this.isLoading = false;
      if(res.statusCode == 200) {
        this.user.setBookmarks(res.data);
        this.existsMore = !!(res.data.length == this.countPerPage)
      } else {
        console.log(res.message);
        this.user.setBookmarks([]);
        this.existsMore = false;
      }
    }, error => {
      console.log(error);
      this.user.setBookmarks([]);
      this.isLoading = false;
      this.existsMore = false;
    });
  }
}
