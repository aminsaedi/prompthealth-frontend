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

  constructor(
    private _location: Location,
    private _router: Router,
    private _sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    const query = new SocialPostGetAllQuery({status: ['DRAFT']});
    this._sharedService.get('note/get-by-author' + query.toQueryParamsString()).subscribe((res: IGetSocialContentsByAuthorResult) => {
      if(res.statusCode == 200) {
        this.drafts = res.data.map(item => 
          item.contentType == 'ARTICLE' ? new SocialArticle(item) :
          item.contentType == 'EVENT' ? new SocialEvent(item) :
          item.contentType == 'NOTE' ? new SocialNote(item) :
          new SocialPostBase(item)
        );
      } else {
        console.log(res.message);
        this.drafts = [];
      }
    }, error => {
      console.log(error);
      this.drafts = [];
    }, () => {
      this.isLoading = false;
    });
  }

  goback() {
    const state = this._location.getState() as any;
    if(state && state.navigationId == 1) {
      this._router.navigate(['/community/feed']);
    } else {
      this._location.back();
    }
  }

}
