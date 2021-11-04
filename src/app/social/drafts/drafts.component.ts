import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IGetSocialContentsByAuthorResult } from 'src/app/models/response-data';
import { SocialArticle } from 'src/app/models/social-article';
import { SocialEvent } from 'src/app/models/social-event';
import { SocialNote } from 'src/app/models/social-note';
import { ISocialPost, SocialPostBase } from 'src/app/models/social-post';
import { SocialPostGetAllQuery } from 'src/app/models/social-post-get-all-query';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-draft',
  templateUrl: './drafts.component.html',
  styleUrls: ['./drafts.component.scss']
})
export class DraftsComponent implements OnInit {

  public drafts: ISocialPost[];
  public isLoading: boolean = false;
  public existsMore: boolean = true;
  public countPerPage = 20;

  constructor(
    private _location: Location,
    private _router: Router,
    private _sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.fetchDrafts();
  }

  goback() {
    const state = this._location.getState() as any;
    if(state && state.navigationId == 1) {
      this._router.navigate(['/community/feed']);
    } else {
      this._location.back();
    }
  }

  fetchDrafts() {
    this.isLoading = true;
    const query = new SocialPostGetAllQuery({
      status: ['DRAFT'], 
      contentType: ['ARTICLE', 'EVENT'], 
      count: this.countPerPage,
      page: this.drafts ? Math.ceil(this.drafts.length / this.countPerPage) + 1 : 1,
      sortBy: 'createdAt',
      order: 'asc',
    });
    this._sharedService.get('note/get-by-author' + query.toQueryParamsString()).subscribe((res: IGetSocialContentsByAuthorResult) => {
      if(res.statusCode == 200) {
        if(!this.drafts) {
          this.drafts = [];
        }
        res.data.forEach(item => {
          this.drafts.push(          
            item.contentType == 'ARTICLE' ? new SocialArticle(item) :
            item.contentType == 'EVENT' ? new SocialEvent(item) :
            item.contentType == 'NOTE' ? new SocialNote(item) :
            new SocialPostBase(item)
          );
        });
        this.existsMore = !!(res.data.length == this.countPerPage);
      } else {
        console.log(res.message);
        this.existsMore = false;
      }
    }, error => {
      console.log(error);
      this.existsMore = false;
    }, () => {
      this.isLoading = false;
    });
  }
}
