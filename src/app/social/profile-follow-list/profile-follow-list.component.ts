import { isPlatformBrowser, Location } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GetQuery } from 'src/app/models/get-query';
import { Partner } from 'src/app/models/partner';
import { Professional } from 'src/app/models/professional';
import { Profile } from 'src/app/models/profile';
import { IGetFollowingsResult, IGetProfileResult } from 'src/app/models/response-data';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile-follow-list',
  templateUrl: './profile-follow-list.component.html',
  styleUrls: ['./profile-follow-list.component.scss']
})
export class ProfileFollowListComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get linkToBack() {
    const profileId = this._route.snapshot.params.userid;
    const slug = this._route.snapshot.params.slug;
    let link: string[];
    if(slug) {
      link = ['/practitioners', slug];
    } else if(profileId) {
      link = ['/community/profile', profileId];
    } else {
      link = ['/community/feed'];
    }
    return link;
}

  public profile: Professional | Partner;

  public follows: Profile[] = null;
  public existsMore: boolean = true;
  public isLoading: boolean = false;

  private countPerPage = 40;


  constructor(
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _location: Location,
    private _router: Router,
    private _route: ActivatedRoute,
    private _uService: UniversalService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe((params: {userid?: string, slug?: string}) => {
      if (params.slug) {
        // Slug-based route: lookup profile by slug from cache, fallback to API
        const cached = this._socialService.getProfileBySlug(params.slug);
        if (cached) {
          this.onProfileChanged(cached);
        } else {
          // Direct navigation — cache is empty, fetch from API
          this._sharedService.getNoAuth(`user/get-profile-by-slug/${params.slug}`).pipe(takeUntil(this.destroy$)).subscribe((res: IGetProfileResult) => {
            if (res.statusCode === 200) {
              const p = res.data;
              let professional: Professional | Partner;
              if (p.roles === 'P') {
                professional = new Partner(p);
              } else {
                professional = new Professional(p._id, p);
              }
              this._socialService.saveCacheProfile(professional);
              this.onProfileChanged(professional);
            } else {
              this.goback();
            }
          }, () => {
            this.goback();
          });
        }
      } else {
        this.profile = this._socialService.profileOf(params.userid);
        this.onProfileChanged(this.profile);
      }
    });
  }

  onProfileChanged(p: Professional | Partner) {
    this.profile = p;
    if(!p) {
      this.goback();
    } else{    
      this.setMeta();
      if (p.followings) {
        this.follows = p.followings;
        this.checkExistMore();
      } else {
        this.fetchFollowData();
      }  
    }
  }

  setMeta() {
    this._uService.setMeta(this._router.url, {
      title: `${this.profile.name}'s follow list | PromptHealth Community`
    });
  }

  fetchFollowData() {
    const page = (this.follows && this.follows.length > 0) ? Math.ceil(this.follows.length / this.countPerPage) : 1;
    const query = new GetQuery({count: this.countPerPage, page: page});
    const path = 'social/get-followings/' + this.profile._id;

    this.isLoading = true;
    this._sharedService.get(path + query.toQueryParamsString()).pipe(takeUntil(this.destroy$)).subscribe((res: IGetFollowingsResult) => {
      if(res.statusCode == 200) {
        this.profile.setFollowings(res.data);
        this.follows = this.profile.followings;
        this.checkExistMore();
      } else {
        this._toastr.error('Something went wrong. Please try again later');
      }
    }, error => {
      this._toastr.error('Something went wrong. Please try again later');
    }, () => {
      this.isLoading = false;
    });
  }

  checkExistMore() {
    const total = this.profile.numFollowing;
    this.existsMore = !!(this.follows.length < total);
  }

  goback() {
    if (!isPlatformBrowser(this.platformId)) { return; }
    const state = this._location.getState() as any;
    if(state && state.navigationId == 1) {
      const profileId = this._route.snapshot.params.userid;
      const slug = this._route.snapshot.params.slug;
      if(slug) {
        this._router.navigate(['/practitioners', slug]);
      } else if(profileId) {
        this._router.navigate(['/community/profile', profileId]);
      } else {
        this._router.navigate(['/community/feed']);
      }
    } else {
      this._location.back();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
