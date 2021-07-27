import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialPost } from 'src/app/models/social-post';
import { SharedService } from 'src/app/shared/services/shared.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

  public post: SocialPost;

  private userId: string;
  private slug: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _socialService: SocialService,
    private _sharedService: SharedService,
  ) { }

  ngOnInit(): void {

    this._route.params.subscribe((param: {userid: string, slug: string}) => {
      this.userId = param.userid;
      this.slug = param.slug;

      this.initPost();
    }); 
  }

  initPost() {
    return new Promise((resolve, reject) => {
      const post = this._socialService.postOfSlug(this.slug);
      if(post) {
        this.post = post;
        resolve(true);
      } else {
        const path = `blog/get-by-slug/${this.slug}`;
        this._sharedService.getNoAuth(path).subscribe((res: any) => {
          if(res.statusCode === 200) {
            this._socialService.saveCacheSingle(res.data);
            this.post = this._socialService.postOfSlug(this.slug);

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

  goback() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      this._router.navigate(['/community/feed']);
    } else {
      this._location.back();
    }
  }
}
