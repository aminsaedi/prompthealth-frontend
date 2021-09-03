import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { SocialNotification } from 'src/app/models/notification';
import { Professional } from 'src/app/models/professional';
import { Profile } from 'src/app/models/profile';
import { IGetNotificationsResult, ISearchResult } from 'src/app/models/response-data';
import { SearchQuery } from 'src/app/models/search-query';
import { SocialArticle } from 'src/app/models/social-article';
import { SocialEvent } from 'src/app/models/social-event';
import { SocialNote } from 'src/app/models/social-note';
import { ISocialPost, SocialPostBase } from 'src/app/models/social-post';
import { FormItemInputComponent } from 'src/app/shared/form-item-input/form-item-input.component';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation, fadeAnimation, slideHorizontalReverseAnimation, slideVerticalReverseAnimation } from 'src/app/_helpers/animations';
import { SocialService } from '../social.service';

@Component({
  selector: 'header-social',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [slideHorizontalReverseAnimation, slideVerticalReverseAnimation, fadeAnimation, expandVerticalAnimation],
})
export class HeaderComponent implements OnInit {

  public isHeaderShown: boolean = true;
  public isMenuMobileShown: boolean = false; 
  public isUserMenuShown: boolean = false;
  public isMenuSearchShown: boolean = false;
  public isNotificationSummaryShown: boolean = false;

  public isSearchLoading = false;
  searchResult: {users: Professional[], blogs: ISocialPost[]};

  public formSearch: FormControl;

  get topics() { return this._catService.categoryList; }
  get userImage() { return this.user ? this.user.profileImage : ''; }
  get userName() { return this.user ? this.user.nickname : ''; }
  get user(): Profile { return this._profileService.profile; }

  get numNotifications(): number { return this._socialService.notifications ? this._socialService.notifications.length : 0 };
  get numUnreadNotifications() : number{
    let num = 0;
    if(this._socialService.notifications) {
      this._socialService.notifications.forEach(n => {
        if(!n.isRead) {
          num++;
        }
      });
    }
    return num;
  }

  get sizeS(): boolean { return (!window || window.innerWidth < 768); }

  private subscriptionLoginStatus: Subscription;


  @ViewChild('searchbar') private searchbar: FormItemInputComponent;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _location: Location,
    private _catService: CategoryService,
    private _headerService: HeaderStatusService,
    private _changeDetector: ChangeDetectorRef,
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
    private _sharedService: SharedService,
    private _socialService: SocialService,
  ) { }

  isActiveTaxonomy(type: string) {
    const regex = new RegExp('community\/' + type)
    return !!(this._location.path().match(regex));
  }

  iconOf(topic: Category): string {
    return this._catService.iconOf(topic);
  }

  ngOnDestroy() {
    if(this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus.unsubscribe();
    }
  }
  ngOnInit(): void {

    this.observeLoginStatus();

    this.formSearch = new FormControl();
    this.formSearch.valueChanges.subscribe((val) => {
      this.onSearchValueChanged(val);
    });
    
    this._headerService.observeHeaderStatus().subscribe(([key, val]: [string, any]) => {
      this[key] = val;
      this._changeDetector.detectChanges();
    });

    this._route.queryParams.subscribe((param: {menu: 'mobile' | 'search'}) => {
      this.isMenuMobileShown = (param.menu == 'mobile') ? true : false;
      this.isMenuSearchShown = (param.menu == 'search') ? true : false;
    });
  }

  hideMenu() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      const [path, queryParams] = this._modalService.currentPathAndQueryParams;
      queryParams.menu = null;
      this._router.navigate([path], {queryParams: queryParams, replaceUrl: true});
    } else {
      this._location.back();
    }
  }

  showMenu(id: 'mobile' | 'search') {
    const [path, queryParams] = this._modalService.currentPathAndQueryParams;
    queryParams.menu = id;
    this._router.navigate([path], {queryParams: queryParams});
    if(id == 'search') {
      setTimeout(() => {
        this.searchbar.focus();
      }, 300);  
    }
  }

  onClickProfileIcon() {
    if(this.user) {
      this._modalService.show('user-menu', this.user);
    } else {
      this._modalService.show('login-menu', this.user);
    }
  }

  onClickButtonMore() {
    this._modalService.show('more-menu');
  }

  navigateTo(route: string[], replaceUrl: boolean = false) {
    this._router.navigate(route, {replaceUrl: replaceUrl});
  }

  toggleNotificationSummary() {
    if (this.isNotificationSummaryShown) {
      this.hideNotificationSummary();
    } else {
      this.showNotificationSummary();
    }
  }

  showNotificationSummary() {
    this.isNotificationSummaryShown = true;
  }
  hideNotificationSummary() {
    this.isNotificationSummaryShown = false;
  }

  changeTopics(topic: Category) {
    const path = this._location.path();
    const match = path.match('/community/(feed|article|media|event)');
    const taxonomyType = match ? match[1] : 'feed';
    this._router.navigate(['/community', taxonomyType, topic._id], {replaceUrl: true});
  }

  resetSearch() {
    this.formSearch.setValue('');
  }

  private timer: any;
  onSearchValueChanged(keyword: string) {
    if(this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      if(keyword.length <= 2) { 
        this.searchResult = null;
      } else {
        this.search(keyword);
      }
    }, 500)
  }

  search(keyword: string) {
    const query = new SearchQuery({count: 3});
    this.isSearchLoading = true;
    this._sharedService.getNoAuth(
      'common/search/' + keyword + query.toQueryParamsString()
    ).subscribe((res: ISearchResult) => {
      if(res.statusCode == 200) {
        this.searchResult = {users: [], blogs: []};
        if(res.data.users && res.data.users.length > 0) {
          this.searchResult.users = res.data.users.map(user=> new Professional(user._id, user));
        }
        if(res.data.blogs && res.data.blogs.length > 0) {
          this.searchResult.blogs = res.data.blogs.map(blog => 
            blog.contentType == 'NOTE' ? new SocialNote(blog) : 
            blog.contentType == 'ARTICLE' ? new SocialArticle(blog) :
            blog.contentType == 'EVENT' ? new SocialEvent(blog) :
            new SocialPostBase(blog)
          );
        }
      } else {
        this.searchResult = null;
      }
    }, error => {
      console.log(error);
      this.searchResult = null;
    }, () => {
      this.isSearchLoading = null;
    });  
  }

  observeLoginStatus() {
    const status = this._profileService.loginStatus;
    if(status == 'loggedIn' && !this._socialService.doneInitNotification) {
      this.fetchNotification();
    }

    this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe(status => {
      if(status == 'loggedIn') {
        this.fetchNotification();
      }
    });
  }

  fetchNotification() {
    console.log('fetchNotification');
    this._sharedService.get('notification/get-all').subscribe((res: IGetNotificationsResult) => {
      if(res.statusCode == 200) {
        this._socialService.saveNotifications(res.data);
      } else {
        console.log(res.message);
      }
    }, error => {
      console.log(error);
    });
  }
}