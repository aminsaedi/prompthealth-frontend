import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';
import { HeaderStatusService } from '../../shared/services/header-status.service';
import { environment } from '../../../environments/environment';
import { fadeAnimation, fadeFastAnimation, slideHorizontalAnimation, slideVerticalAnimation } from '../../_helpers/animations';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ProfileManagementService } from '../../dashboard/profileManagement/profile-management.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { Location } from '@angular/common';
import { IUserDetail } from 'src/app/models/user-detail';
import { Profile } from 'src/app/models/profile';
import { Subscription } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAnimation, fadeFastAnimation, slideVerticalAnimation, slideHorizontalAnimation]
})
export class HeaderComponent implements OnInit {

  get onProductPage(){ return !!this._router.url.match('product'); }
  get isLoggedIn(): boolean { return !!this.user; }
  get userRole() { return this.user ? this.user.role : null; }

  get userId() { return this.user ? this.user._id : ''; }
  get userName() { return this.user ? this.user.name : 'No name' }
  

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _location: Location,
    private _sharedService: SharedService,
    private _headerStatusService: HeaderStatusService,
    public catService: CategoryService,
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
    private _modalService: ModalService,
  ) { }

  public user: Profile;
  public isHeaderShown = true;
  public isMenuSmShown = false;
  public isDashboardMenuShown = false;
  public isUserTypeMenuShown = false;
  public isShadowShown = false;

  public AWS_S3 = environment.config.AWS_S3;

  public priceType: PriceType = null;

  private subscriptionLoginStatus: Subscription;

  ngOnDestroy() {
    if(this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus.unsubscribe();
    }
  }

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

      this.user = this._profileService.profile;
      this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe(() => {
        this.user = this._profileService.profile;
        this.setPriceType(this.user ? this.user.role : null);
      });
    }
  }

  hideMenuSm(nextRoute: string[] = null) {
    if(nextRoute) {
      this._router.navigate(nextRoute, {replaceUrl: true});  
    } else {
      const state = this._location.getState() as any;
      if(state.navigationId == 1) {
        const [path, queryParams] = this._modalService.currentPathAndQueryParams;
        queryParams.menu = null;
        this._router.navigate([path], {queryParams: queryParams, replaceUrl: true});  
      } else {
        this._location.back();
      }  
    }
  }
  
  showMenuSm() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {menu: 'show'}});
  }
 
  onClickMenuItemSm(goto: string) {
    this.hideMenuSm([goto]);
  }

  onClickRegister() {
    this._modalService.show('user-type-menu');
  }

  onClickUserTypeMenuItem(userType: UserType, goto: string) {
    this.setPriceType(userType);
    this._modalService.hide(true, [goto]);
  }
  
  onClickUserIcon() {
    this._modalService.show('user-menu', this.user);
  }

  onClickUserMenuItem(route: string[]) {
    this._modalService.hide(true, route);
  }

  onClickUserMenuItemLogout() {
    this._sharedService.logout();
    this._modalService.hide();
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
}

export type PriceType = 'practitioner' | 'product';
type UserType = 'client' | 'practitioner' | 'provider' | 'centre' | 'product';