import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { Profile } from 'src/app/models/profile';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { HeaderStatusService } from 'src/app/shared/services/header-status.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { fadeAnimation, slideHorizontalReverseAnimation, slideVerticalReverseAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'header-social',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [slideHorizontalReverseAnimation, slideVerticalReverseAnimation, fadeAnimation],
})
export class HeaderComponent implements OnInit {

  public isHeaderShown: boolean = true;
  public isMenuMobileShown: boolean = false; 
  public isUserMenuShown: boolean = false;
  public isMenuSearchShown: boolean = false;
  public isNotificationSummaryShown: boolean = false;

  public formSearch: FormControl;

  get topics() { return this._catService.categoryList; }
  get userImage() { return this.user ? this.user.profileImage : ''; }
  get userName() { return this.user ? this.user.name : '(No Name)'; }
  get user(): Profile { return this._profileService.profile; }

  get sizeS(): boolean { return (!window || window.innerWidth < 768); }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _location: Location,
    private _catService: CategoryService,
    private _headerService: HeaderStatusService,
    private _changeDetector: ChangeDetectorRef,
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
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
    this.formSearch = new FormControl();
    
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
}