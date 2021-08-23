import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISocialPost } from 'src/app/models/social-post';
import { SharedService } from 'src/app/shared/services/shared.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

  public post: ISocialPost;

  private userId: string;
  private postId: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _socialService: SocialService,
    private _sharedService: SharedService,
  ) { }

  ngOnInit(): void {

    this._route.params.subscribe((param: {userid: string, postid: string}) => {
      this.userId = param.userid;
      this.postId = param.postid;

      this.initPost();
    }); 
  }

  initPost() {
    return new Promise((resolve, reject) => {
      const post = this._socialService.postOf(this.postId);
      if(post) {
        this.post = post;
        this.fetchComments();
        resolve(true);
      } else {
        const path = `note/${this.postId}`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if(res.statusCode === 200) {
            console.log(res.data)
            this._socialService.saveCacheSingle(res.data);
            this.post = this._socialService.postOf(this.postId);
            this.fetchComments();

            resolve(true);
          } else {
            console.log(res);
            reject(res.message);
          }
        }, err => {
          console.log(err);
          reject(err);
        });   

      }  
    });
  }

  fetchComments() {
    this._sharedService.getNoAuth('blog/comment/' + this.post._id).subscribe((res: any) => {
      console.log(res);
      this.post.setComments(res.data as any);
    })
  }

  goback() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      this._router.navigate(['/community/feed']);
    } else {
      this._location.back();
    }
  }
}
