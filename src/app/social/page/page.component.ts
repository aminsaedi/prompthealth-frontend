import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IGetSocialContentResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { formatDateToString } from 'src/app/_helpers/date-formatter';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

  public post: ISocialPost;
  private postId: string;

  public isReturnToAppShown = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _uService: UniversalService,
    private _headerService: HeaderStatusService,
  ) { }

  ngOnDestroy() {
    this.hideReturnToApp();
  }

  ngOnInit(): void {
    this._route.params.subscribe((param: {postid: string}) => {
      this.postId = param.postid;
      this.initPost();

      //when url is changed within this component after second time, then returnToApp should be false;
      this.hideReturnToApp();
    });

    this.showReturnToAppIfNeeded();
  }

  async initPost() {
    this.post = null;
    const post = this._socialService.postOf(this.postId);
    if(post) {
      this.post = post;
    } else {
      try {
        await this.fetchPost();
        this.post = this._socialService.postOf(this.postId);
      } catch (error) {
        console.log(error);
      }
    }

    if(this.post) {
      this.setMeta();  
    } else {
      this._toastr.error('Could not find the content. Please try again');
      this._router.navigate(['/404'], {replaceUrl: true});
    }
  }

  fetchPost() {
    return new Promise((resolve, reject) => {
      const path = `note/${this.postId}`;
      this._sharedService.get(path).subscribe((res: IGetSocialContentResult) => {
        if(res.statusCode === 200) {
          this._socialService.saveCacheSingle(res.data);
          resolve(true);
        } else {
          console.log(res);
          reject(res.message);
        }
      }, err => {
        console.log(err);
        reject(err);
      });
    });
  }

  setMeta(){
    let title: string;
    if (this.post.isNote) {
      title = `A note from ${this.post.authorName} posted at ${formatDateToString(new Date(this.post.createdAt))}`;
    } else if (this.post.isPromo) {
      title = `Special discount offer from ${this.post.authorName}!${this.post.availableUntil ? (' Available until ' + formatDateToString(this.post.availableUntil as Date, true)) : ''}`;
    } else {
      title = this.post.title;
    }

    this._uService.setMeta(this._router.url, {
      title: title + ' | PromptHealth Community',
      description: this.post.summary,
      pageType: 'article',
      image: this.post.coverImage,
      imageType: this.post.coverImageType,
      imageAlt: 'A note from ' + this.post.authorName,
    });
  }
 
  showReturnToAppIfNeeded() {
    const params = this._route.snapshot.queryParams;
    if(params.returnToApp) {
      this.showReturnToApp();
    }
  }

  showReturnToApp() {
    this.isReturnToAppShown = true;
    this._headerService.hideHeader();
  }

  hideReturnToApp() {
    this.isReturnToAppShown = false;
    this._headerService.showHeader();
  }
}
