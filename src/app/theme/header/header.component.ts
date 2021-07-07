import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';
import { HeaderStatusService } from '../../shared/services/header-status.service';
import { environment } from '../../../environments/environment';
import { fadeAnimation, fadeFastAnimation, slideHorizontalAnimation, slideVerticalAnimation } from '../../_helpers/animations';
// import { Subscription } from 'rxjs';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ProfileManagementService } from '../../dashboard/profileManagement/profile-management.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAnimation, fadeFastAnimation, slideVerticalAnimation, slideHorizontalAnimation]
})
export class HeaderComponent implements OnInit {

  @ViewChild('signupModal') public signupModal: ModalDirective;
  @ViewChild('dashboardButton') private dashboardButton: ElementRef;
  get onProductPage(){ return !!this._router.url.match('product'); }

  /////// NEW
  get isLoggedIn(): boolean { return !!this.token; }
  navigateTo(route: string[] | string, hideMenu: boolean = true){
    const _route: string[] = (typeof route == 'string') ? [route] : route;
    this._router.navigate(_route);
    if (hideMenu) {
      this.hideMenu();
    }
  }
  /////// NEW END


  constructor(
    private _router: Router,
    private _sharedService: SharedService,
    private _bs: BehaviorService,
    // private toastr: ToastrService,
    private _headerStatusService: HeaderStatusService,
    public catService: CategoryService,
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
    _el: ElementRef
  ) {
    // this.fetchUser();
    this.elHost = _el.nativeElement;
  }

  private elHost: HTMLElement;

  // @ViewChild('signup') signup: ElementRef;
  // @ViewChild('signin') signin: ElementRef;
  // _host = environment.config.BASE_URL;
  // showDashboard = false;
  public token = '';
  public role = '';
  public payment = 'true';

  public isMenuMobileForcibly = false;
  public isHeaderShown = true;
  public isNavMenuShown = false;
  public isDashboardMenuShown = false;
  public isShadowShown = false;
  public levelMenuSm = 0;
  public activeCategory = 0;

  public AWS_S3 = '';

  public priceType: PriceType = null;

  user: any = {};
  // updateData: any;
  // cities = [];
  // Items = [];
  // showCities = false;
  // showItems = false;
  @Input() eventKey: any;
  // eventKeyValue: any;
  // searchKeyword: any;
  // dashboard: any;
  // currentUrl = '';
  // uname: any;
  // public userType = '';
  // professionalOption = false;


  public classSubcategory = '';
  public classSubcategoryItem = '';
  // End Ngoninit
  public keyword: string;

  // Start ngOninit
  async ngOnInit() {
    const ls = this._uService.localStorage;
    this.AWS_S3 = environment.config.AWS_S3;

    if (!this._uService.isServer) {
      const isTouchEnabled = !!('ontouchstart' in window);
      if(navigator.userAgent.toLowerCase().match('ipad|android|iphone') || (isTouchEnabled && navigator.userAgent.toLowerCase().match('mac')) ){
        this.isMenuMobileForcibly = true;
      }

      this._headerStatusService.observeHeaderStatus().subscribe(([key, val]: [string, any]) => {
        this[key] = val;
        this._changeDetector.detectChanges();
      });

      this._bs.getUserData().subscribe((res: any) => {
        if (res.firstName) {
          ls.setItem('user', JSON.stringify(res));
          this.user = ls.getItem('user') ? JSON.parse(ls.getItem('user')) : {};
          this.token = ls.getItem('token');
          this.role = ls.getItem('roles');
        }
        this.role = this.user.roles || null;
        switch(this.user.roles){
          case 'SP':
          case 'C':
            this.setPriceType('practitioner');
            break;
          case 'P':
            this.setPriceType('product');
            break;
          default:
            this.setPriceType();
        }
      });

      this.token = ls.getItem('token');
      this.role = ls.getItem('roles');
      this.user = ls.getItem('user') ? JSON.parse(ls.getItem('user')) : {};

      this._bs.setUserData(this.user);
    }

    this._router.events.subscribe(evt => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      // this.currentUrl = evt.url;
      this.token = ls.getItem('token');
      this.role = ls.getItem('roles');
      this.payment = ls.getItem('isPayment');
      this.user = ls.getItem('user') ? JSON.parse(ls.getItem('user')) : {};
      // if (this.token && this.user) {
      //   const roles = this.user.roles;
      //   this.dashboard = roles === 'B' ? 'dashboard/home' : 'dashboard/welcome';
      // }
    });

    // this._bs.user.subscribe(obj => {
    //   this.user = obj ? (obj["user"] ? obj["user"] : []) : [];
    // });

    this.token = ls.getItem('token');
    this.role = ls.getItem('roles');
    this.payment = ls.getItem('isPayment');
    this.user = ls.getItem('user') ? JSON.parse(ls.getItem('user')) : {};

    if(this.user._id){
      //call getProfileDetail function to fetch latest data which is changed by admin including verifiedBadge
      try { await this._profileService.getProfileDetail(this.user); }
      catch(err){ console.log(err); }
    }
    // if(this.token) {
    //   if(this.role === 'U') {
    //     this.showDashboard = true;
    //   }
    //   if(this.payment === 'true') {

    //     this.showDashboard = true;
    //   }
    // }
  }
  // route(path) {
  //   this._router.navigate([path]);
  // }

  keywordSearch() {
    this._router.navigate(['/practitioners'], {
      queryParams: {
        keyword: this.keyword
      }
    });
  }
  logout() {
    this.token = '';
    this.user = {};
    this._sharedService.logout();
  }


  // isSelectedURL(path) {
  //   if ((this.currentUrl === '/' || this.currentUrl === '') && path === '/') {
  //     return true;
  //   } else if (this.currentUrl.indexOf(path) >= 0 && path !== '/') { return true; } else { return false; }
  // }

  // handleChange(url, type) {
  //   // console.log(url);
  //   this._router.navigate([url, type]).then(res => {
  //     // console.log(res);
  //   });
  //   if (url === '/auth/login') {
  //     this.signin.nativeElement.click();
  //   } else {
  //     this.signup.nativeElement.click();
  //   }
  // }

  // optUserType(value) {
  //   // this._bs.setRole(value);
  //   this._uService.localStorage.setItem('userType', value);
  // }


  hideMenu() { this._headerStatusService.hideNavMenu(); }
  showMenu(jumpToCategory: boolean = false) {

    setTimeout(() => {
      this._headerStatusService.showNavMenu(jumpToCategory);
    });
  }

  scrollMenuSm(n: number) { this._headerStatusService.changeLevelMenuSm(n); }

  changeMenuCategory(i: number) {
    this.activeCategory = i;
    this.setClassForSubcategory(i);
  }

  onMouseOverMenuMd(i: number){
    this.changeMenuCategory(i);
  }

  onClickMenuMd(i: number){
    if(this.activeCategory != i){
      this.changeMenuCategory(i);
    }else{
      this.hideMenu();
      this._router.navigate(
        ['/practitioners/category', this.catService.categoryList[i]._id], 
      );
    }
  }

  setClassForSubcategory(i: number) {
    let clname = ['', ''];
    switch (this.catService.categoryList[i]._id) {
      case '5eb1a4e199957471610e6ce7': clname = ['', 'lower narrowest']; break;       /** pain_management */
      case '5eb1a4e199957471610e6ce8': clname = ['h-100', 'lower']; break;            /** women_mens_health */
      case '5eb1a4e199957471610e6ce1': clname = ['h-100', 'lowest narrower']; break;  /** mood_mental_health*/
      case '5eb1a4e199957471610e6ce4':                                                /** sleep */
      case '5eb1a4e199957471610e6ce3': clname = ['h-100', '']; break;                 /** fitness */
    }
    this.classSubcategory = clname[0];
    this.classSubcategoryItem = clname[1];
  }

  onClickOutsideOfDashboardMenuMd(e: Event) {
    const target = e.target as HTMLElement;
    const dashboardMenuButton = this.elHost.querySelector('#dashboardMenuButton');
    if (!dashboardMenuButton.contains(target)) {
      this.isDashboardMenuShown = false;
    }
  }

  private timerScrollCategory: any;
  private isCategoryScrolling: boolean = false;
  onMouseOverRootMenuCategory(e: MouseEvent){
    const menu = (this.elHost.querySelector('.menu-category') as HTMLElement)
    const menuRect = menu.getBoundingClientRect();

    if(menuRect.bottom - e.y < 50){ 
      if(!this.isCategoryScrolling){
        let scrollTotal: number = 0;
        this.isCategoryScrolling = true;
        this.timerScrollCategory = setInterval(() => {
          scrollTotal += 10;
          menu.scrollBy(0,10);
          if(scrollTotal > 500){ clearInterval(this.timerScrollCategory); }
        }, 30);  
      }
    }else if (e.y - menuRect.top < 50){
      if(!this.isCategoryScrolling){
        let scrollTotal: number = 0;
        this.isCategoryScrolling = true;
        this.timerScrollCategory = setInterval(() => {
          scrollTotal += 10;
          menu.scrollBy(0, -10);
          if(scrollTotal > 500){ clearInterval(this.timerScrollCategory); }
        }, 30);  
      }
    }
    else{
      this.isCategoryScrolling = false;
      if(this.timerScrollCategory){ clearInterval(this.timerScrollCategory); }
    }
  }

  setPriceType(type: PriceType = null){
    this.priceType = type;
  }

  public positionDashboardMenuMd = null;
  toggleDashboardMenuMdVisibility() {
    this.isDashboardMenuShown = !this.isDashboardMenuShown;
    if(this.isDashboardMenuShown) {
      console.log(this.dashboardButton);
      const rect = this.dashboardButton.nativeElement.getBoundingClientRect();
      const right = (window.innerWidth - rect.right > 30) ? (window.innerWidth - rect.right - 10) : 10
      this.positionDashboardMenuMd = {
        right: right + 'px',
      };
    }
  }
}

export type PriceType = 'practitioner' | 'product';
