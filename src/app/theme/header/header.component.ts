import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';
import { HeaderStatusService } from '../../shared/services/header-status.service';
import { environment } from '../../../environments/environment';
import { fadeAnimation, fadeFastAnimation, slideHorizontalAnimation, slideVerticalAnimation } from '../../_helpers/animations';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ProfileManagementService } from '../../dashboard/profileManagement/profile-management.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { Location } from '@angular/common';
import { IUserDetail } from 'src/app/models/user-detail';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAnimation, fadeFastAnimation, slideVerticalAnimation, slideHorizontalAnimation]
})
export class HeaderComponent implements OnInit {

  @ViewChild('dashboardButton') private dashboardButton: ElementRef;

  get onProductPage(){ return !!this._router.url.match('product'); }
  get isLoggedIn(): boolean { return !!this.user; }
  get role(): IUserDetail['roles'] { return this.user ? this.user.roles : null; }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _location: Location,
    private _sharedService: SharedService,
    private _bs: BehaviorService,
    private _headerStatusService: HeaderStatusService,
    public catService: CategoryService,
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
    _el: ElementRef
  ) {
    this.elHost = _el.nativeElement;
  }

  private elHost: HTMLElement;

  public user: IUserDetail = null;

  public isHeaderShown = true;
  public isMenuSmShown = false;
  public isDashboardMenuShown = false;
  public isUserTypeMenuShown = false;
  public isShadowShown = false;

  public AWS_S3 = environment.config.AWS_S3;

  public priceType: PriceType = null;



  async ngOnInit() {
    const ls = this._uService.localStorage;

    this._route.queryParams.subscribe((param: {menu: 'show', modal: 'user-type-menu'}) => {
      this.isMenuSmShown = (param.menu == 'show');
      this.isUserTypeMenuShown = (param.modal == 'user-type-menu');
    });

    if (!this._uService.isServer) {
      this._headerStatusService.observeHeaderStatus().subscribe(([key, val]: [string, any]) => {
        this[key] = val;
        this._changeDetector.detectChanges();
      });

      this._bs.getUserData().subscribe((res: any) => {
        this.initUser(res);
      });

      const userStr = ls.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      this.initUser(user);
    }
  }

  async initUser(user: IUserDetail) {
    if(user && user._id) {
      try { this.user = await this._profileService.getProfileDetail(user); }
      catch(err){ console.log(err); }  
    } else {
      this.user = null;
    }

    const role = this.user ? this.user.roles : null;
    this.setPriceType(role);
  }

  hideMenuSm() {
    this._location.back();
  }
  showMenuSm() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {menu: 'show'}});
  }
  onClickMenuItemSm(goto: string) {
    this._router.navigate([goto], {replaceUrl:true});
  }

  onClickRegisterMd() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {modal: 'user-type-menu'}});    
  }

  onClickRegisterSm() {
    this._router.navigate(['./'], {relativeTo: this._route, replaceUrl: true, queryParams: {modal: 'user-type-menu'}});    
  }

  hideUserTypeMenu() {
    this._location.back();
  }
  onClickUserTypeMenuItem(userType: UserType, goto: string) {
    this.setPriceType(userType);
    this._router.navigate([goto], {replaceUrl: true});
  }
  

  onClickOutsideOfDashboardMenuMd(e: Event) {
    const target = e.target as HTMLElement;
    const dashboardMenuButton = this.elHost.querySelector('#dashboardMenuButton');
    if (!dashboardMenuButton || !dashboardMenuButton.contains(target)) {
      this.isDashboardMenuShown = false;
    }
  }
  onClickDashboardMenuItemMd(goto: string){
    this.isDashboardMenuShown = false;
    this._router.navigate([goto]);
  }
  logout() {
    this.isDashboardMenuShown = false;
    this._sharedService.logout();
  }

  logoutSm() {
    this._location.back();
    this.logout();
  }

  setPriceType(type: UserType | IUserDetail['roles'] = null){
    switch(type) {
      case 'practitioner':
      case 'provider':
      case 'centre':
      case 'SP':
      case 'C':
        this.priceType = 'practitioner';
        break;
      case 'product':
      case 'P':
        this.priceType = 'product';
        break;
      default: 
        this.priceType = null;
    }
  }

  public positionDashboardMenuMd = null;
  toggleDashboardMenuMdVisibility() {
    this.isDashboardMenuShown = !this.isDashboardMenuShown;
    if(this.isDashboardMenuShown) {
      const rect = this.dashboardButton.nativeElement.getBoundingClientRect();
      const right = (window.innerWidth - rect.right > 30) ? (window.innerWidth - rect.right - 10) : 10
      this.positionDashboardMenuMd = {
        right: right + 'px',
      };
    }
  }
}

export type PriceType = 'practitioner' | 'product';
type UserType = 'client' | 'practitioner' | 'provider' | 'centre' | 'product';