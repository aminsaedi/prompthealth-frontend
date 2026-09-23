import { Component, OnInit, ChangeDetectorRef , OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderStatusService } from '../../shared/services/header-status.service';
import { environment } from '../../../environments/environment';
import { expandVerticalAnimation, fadeAnimation, fadeFastAnimation, slideHorizontalAnimation, slideVerticalAnimation } from '../../_helpers/animations';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ProfileManagementService } from '../../shared/services/profile-management.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { IUserDetail } from 'src/app/models/user-detail';
import { Subscription , Subject } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { getListedMenu } from 'src/app/_helpers/get-listed-menu';
import { SearchBarService } from 'src/app/shared/services/search-bar.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAnimation, fadeFastAnimation, slideVerticalAnimation, slideHorizontalAnimation, expandVerticalAnimation]
})
export class HeaderComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get onProductPage(){ return !!this._router.url.match('product'); }
  get isLoggedIn(): boolean { return !!this.user; }
  get userRole() { return this.user ? this.user.role : null; }
  get userId() { return this.user ? this.user._id : ''; }
  get user() { return this._profileService.profile; }

  constructor(
    private _router: Router,
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
    this.destroy$.next();
    this.destroy$.complete();
    if(this.subscriptionLoginStatus) {
      this.subscriptionLoginStatus.unsubscribe();
    }
  }

  async ngOnInit() {
    const ls = this._uService.localStorage;

    if (!this._uService.isServer) {
      this._headerStatusService.observeHeaderStatus().pipe(takeUntil(this.destroy$)).subscribe(([key, val]: [string, any]) => {
        this[key] = val;
        this._changeDetector.detectChanges();
      });

      this.subscriptionLoginStatus = this._profileService.loginStatusChanged().pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.setPriceType(this.user ? this.user.role : null);
      });
    }
  }

  /* The menu is state on top of the page, not a new page, so it keeps the rest
   * of the query: replacing it dropped a campaign's UTMs whenever the menu
   * opened. Built from the address the reader sees, as ModalService does, and
   * not with queryParamsHandling 'merge', which merges into the router's copy.
   * AppComponent removes ?action=stripe-cancel with location.replaceState,
   * which the router never hears about, so 'merge' put it back and the Stripe
   * toast showed a second time. */
  showMenuSm() {
    const [path, queryParams] = this._modalService.currentPathAndQueryParams;
    queryParams.menu = 'show';
    this._router.navigate([path], {queryParams: queryParams});
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