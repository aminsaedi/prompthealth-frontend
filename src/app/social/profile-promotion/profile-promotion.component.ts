import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { IGetSocialContentsByAuthorResult } from 'src/app/models/response-data';
import { ISocialPost } from 'src/app/models/social-post';
import { SocialPostSearchQuery } from 'src/app/models/social-post-search-query';
import { SocialPromo } from 'src/app/models/social-promo';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { expandVerticalAnimation, fadeAnimation } from 'src/app/_helpers/animations';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-promotion',
  templateUrl: './profile-promotion.component.html',
  styleUrls: ['./profile-promotion.component.scss'],
  animations: [fadeAnimation, expandVerticalAnimation],
})
export class ProfilePromotionComponent implements OnInit {

  get profile() { return this._socialService.selectedProfile; }
  get user() { return this._profileService.profile; }
  get isMyself() { return this.user && this.profile && this.user._id == this.profile.id; }
  get promos() { return this.profile ? this._socialService.promosOfUser(this.profile._id) : null; }


  public posts: ISocialPost[];
  public newPromos: ISocialPost[] = [];
  private countPerPage = 2;
  private isMorePromos = true;
  public isLoading = false;

  private subscription: Subscription;

  @HostListener('window:scroll', ['$event']) onWindowScroll(e: Event) {
    if(!this.isLoading && this.isMorePromos && document.body && this.promos && this.promos.length > 0) {
      const startLoad = !!(document.body.scrollHeight < window.scrollY + window.innerHeight * 2);
      if(startLoad) {
        this.fetchPromos();
      }
    }
  }

  constructor(
    private _socialService: SocialService,
    private _profileService: ProfileManagementService,
    private _sanitizer: DomSanitizer,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();  

    if(this.newPromos?.length > 0) {
      for(let i = this.newPromos.length - 1; i>=0; i-- ) {
        this._socialService.saveCacheSingle(this.newPromos[i].decode(), this.profile._id);
      }
    }

  }

  ngOnInit(): void {
    this.setMeta();

    this.onProfileChanged();
    this.subscription = this._socialService.selectedProfileChanged().subscribe(() => {
      this.onProfileChanged();
    });
  }


  onProfileChanged() {
    this.setMeta();
  }

  setMeta() {
    if(this.profile) {
      this._uService.setMeta(this._router.url, {
        title: `Special offers from ${this.profile.name} | PromptHealth Community`,
        description: `Check out special offers from ${this.profile.name}`,
        image: this.profile.imageFull,
        imageType: this.profile.imageType,
        imageAlt: this.profile.name,
      });  
    }
  }


  fetchPromos(): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = new SocialPostSearchQuery({
        order: 'desc',
        count: this.countPerPage,
        contentType: 'PROMO',
        ...(this.promos?.length > 0) && {timestamp: this.promos[this.promos.length - 1].createdAt},
      })

      this.isLoading = true;
      this._sharedService.get('note/get-by-author/' + this.profile._id + query.toQueryParams()).subscribe((res: IGetSocialContentsByAuthorResult) => {
        this.isLoading = false;
        if(res.statusCode === 200) {
          this.isMorePromos = (res.data.length < this.countPerPage) ? false : true;
          this._socialService.saveCachePromosOfUser(res.data, this.profile._id);
          resolve();
        } else {
          console.log(res.message);
          this.isMorePromos = false;
          reject();
        }
      }, error => {
        this.isLoading = false;
        this.isMorePromos = false;
        console.log(error);
        reject();
      });
    });
  }

  onNewPromoPublished(data: ISocialPost) {
    data.author = this._profileService.user;
    const promo = new SocialPromo(data);
    this.newPromos.unshift(promo);
  }
}
