import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IGetSocialContentResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
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

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe((param: {postid: string}) => {
      this.postId = param.postid;
      this.initPost();
    }); 
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
    this._uService.setMeta(this._router.url, {
      title: (this.post.isNote ? `A note from ${this.post.authorName} posted at ${formatDateToString(new Date(this.post.createdAt))}` : this.post.title) + ' | PromptHealth Community',
      description: this.post.summary,
      pageType: 'article',
      image: this.post.coverImage,
      imageType: this.post.coverImageType,
      imageAlt: 'A note from ' + this.post.authorName,
    });
  }

  goback() {
    const state = this._location.getState() as any;
    if(state && state.navigationId == 1) {
      this._router.navigate(['/community/profile', this.post.authorId]);
    } else {
      this._location.back();
    }
  }
}
