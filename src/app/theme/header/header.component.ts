import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderStatusService } from '../../shared/services/header-status.service';
import { environment } from '../../../environments/environment';
import { expandVerticalAnimation, fadeAnimation, fadeFastAnimation, slideHorizontalAnimation, slideVerticalAnimation } from '../../_helpers/animations';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ProfileManagementService } from '../../shared/services/profile-management.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { IUserDetail } from 'src/app/models/user-detail';
import { Subscription } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { getListedMenu } from 'src/app/_helpers/get-listed-menu';
import { SearchBarService } from 'src/app/shared/services/search-bar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAnimation, fadeFastAnimation, slideVerticalAnimation, slideHorizontalAnimation, expandVerticalAnimation]
})
export class HeaderComponent implements OnInit {

  get onProductPage(){ return !!this._router.url.match('product'); }
  get isLoggedIn(): boolean { return !!this.user; }
  get userRole() { return this.user ? this.user.role : null; }
  get userId() { return this.user ? this.user._id : ''; }
  get user() { return this._profileService.profile; }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _headerStatusService: HeaderStatusService,
    public catService: CategoryService,
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
    private _modalService: ModalService,
    private _searchBarService: SearchBarService,
  ) { }

  public isHeaderShown = true;
  public isShadowShown = false;
  public isPlanMenuShown = false;

  public AWS_S3 = environment.config.AWS_S3;

  public priceType: PriceType = null;
  public planMenuData = getListedMenu;

  private subscriptionLoginStatus: Subscription;

  ngOnDestroy() {
    if(this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus.unsubscribe();
    }
  }

  async ngOnInit() {
    const ls = this._uService.localStorage;

    if (!this._uService.isServer) {
      this._headerStatusService.observeHeaderStatus().subscribe(([key, val]: [string, any]) => {
        this[key] = val;
        this._changeDetector.detectChanges();
      });

      this.subscriptionLoginStatus = this._profileService.loginStatusChanged().subscribe(() => {
        this.setPriceType(this.user ? this.user.role : null);
      });
    }
  }

  showMenuSm() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {menu: 'show'}});
  }
  
  onClickUserIcon() {
    this._modalService.show('user-menu', this.user);
  }

  onClickGetListed() {
    this.isPlanMenuShown = !this.isPlanMenuShown;
  }

  onClickFindProviders() {
    this._searchBarService.dispose();
  }

  hidePlanMenu() {
    this.isPlanMenuShown = false;
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