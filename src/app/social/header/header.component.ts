import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { IUserDetail } from 'src/app/models/user-detail';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { slideHorizontalReverseAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'header-social',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [slideHorizontalReverseAnimation],
})
export class HeaderComponent implements OnInit {

  public isHeaderShown: boolean = true;
  public isMenuSmShown: boolean = false; 
  public isUserMenuShown: boolean = false;

  // public topics: Category[] = [];

  get topics() { return this._catService.categoryList; }
  get userImage() { return this._profileService.getProfileImage(); }
  get userName() { return this._profileService.getFullName(); }
  get user() { return this._profileService.getProfile(); }


  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _location: Location,
    private _catService: CategoryService,
    private _headerService: HeaderStatusService,
    private _changeDetector: ChangeDetectorRef,
    private _profileService: ProfileManagementService,
    private _uService: UniversalService,
  ) { }

  isActiveTaxonomy(type: string) {
    const regex = new RegExp('community\/' + type)
    return !!(this._location.path().match(regex));
  }

  iconOf(topic: Category): string {
    return this._catService.iconOf(topic);
  }

  ngOnInit(): void {
    this._headerService.observeHeaderStatus().subscribe(([key, val]: [string, any]) => {
      this[key] = val;
      this._changeDetector.detectChanges();
    });

    this._route.queryParams.subscribe((param: {menu: 'show'}) => {
      this.isMenuSmShown = (param.menu == 'show') ? true : false;
    });
  }

  hideMenuSm() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
      const [path, queryParams] = this._getPathAndQueryParams();
      queryParams.menu = null;
      this._router.navigate([path], {queryParams: queryParams, replaceUrl: true});
    } else {
      this._location.back();
    }
  }

  showMenuSm() {
    const [path, queryParams] = this._getPathAndQueryParams();
    queryParams.menu = 'show';

    this._router.navigate([path], {queryParams: queryParams});
  }

  showUserMenu() {
    if(this.user && !this.isUserMenuShown) {
      this.isUserMenuShown = true;
    }
  }
  hideUserMenu() {
    this.isUserMenuShown = false;
  }

  _getPathAndQueryParams() {
    const [path, query] = this._location.path().split('?');
    const queryParams: any = {};

    if(query) {
      const array = query.split('&');
      array.forEach(s => {
        const array = s.split('=');
        queryParams[array[0]] = array[1] || null
      });
    }

    return [path, queryParams];
  }
}