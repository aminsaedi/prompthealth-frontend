import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';
import { HeaderStatusService } from '../../shared/services/header-status.service';
import { environment } from '../../../environments/environment';
import { fadeAnimation, fadeFastAnimation } from '../../_helpers/animations';
import { Subscription } from 'rxjs';
import { CategoryService } from 'src/app/shared/services/category.service';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAnimation, fadeFastAnimation]
})
export class HeaderComponent implements OnInit {

  constructor(
    private _router: Router,
    private _sharedService: SharedService,
    private _bs: BehaviorService,
    private toastr: ToastrService,
    private _headerStatusService: HeaderStatusService,
    public catService: CategoryService,
    _el: ElementRef
  ) {
    // this.fetchUser();
    this.elHost = _el.nativeElement;
  }

  private elHost: HTMLElement;

  @ViewChild('signup') signup: ElementRef;
  @ViewChild('signin') signin: ElementRef;
  _host = environment.config.BASE_URL;
  showDashboard = false;
  public token = '';
  public role = '';
  public payment = 'true';

  public isHeaderShown = true;
  public isNavMenuShown = false;
  public isDashboardMenuShown = false;
  public levelMenuSm = 0;
  public activeCategory = 0;

  public AWS_S3 = '';

  user: any = {};
  updateData: any;
  cities = [];
  Items = [];
  showCities = false;
  showItems = false;
  @Input() eventKey: any;
  eventKeyValue: any;
  searchKeyword: any;
  dashboard: any;
  currentUrl = '';
  uname: any;
  userType = '';
  professionalOption = false;


  public classSubcategory = '';
  public classSubcategoryItem = '';
  // End Ngoninit
  public keyword: string;


  // Start ngOninit
  ngOnInit() {

    this.AWS_S3 = environment.config.AWS_S3;

    this._bs.getUserData().subscribe((res: any) => {
      this.updateData = res;
      // console.log('reeeeeeeeeee', this.updateData);
      if (res.firstName) {
        localStorage.setItem('user', JSON.stringify(this.updateData));
        this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
      }
    });

    this.token = localStorage.getItem('token');
    this.role = localStorage.getItem('roles');
    // this.payment = localStorage.getItem(isPayment);
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
    // if (this.token && this.user) {
    //   let roles = this.user.roles;
    //   this.dashboard = roles == "B" ? "dashboard/home" : "dashboard/welcome";
    // }
    this._router.events.subscribe(evt => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      this.currentUrl = evt.url;
      this.token = localStorage.getItem('token');
      this.role = localStorage.getItem('roles');
      this.payment = localStorage.getItem('isPayment');
      this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
      if (this.token && this.user) {
        const roles = this.user.roles;
        this.dashboard = roles === 'B' ? 'dashboard/home' : 'dashboard/welcome';
      }
    });

    // this._bs.user.subscribe(obj => {
    //   this.user = obj ? (obj["user"] ? obj["user"] : []) : [];
    // });

    this.token = localStorage.getItem('token');
    this.role = localStorage.getItem('roles');
    this.payment = localStorage.getItem('isPayment');
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))
      : {};

    this._headerStatusService.observeHeaderStatus().subscribe(([key, val]: [string, any]) => {
      this[key] = val;
    });
    // if(this.token) {
    //   if(this.role === 'U') {
    //     this.showDashboard = true;
    //   }
    //   if(this.payment === 'true') {

    //     this.showDashboard = true;
    //   }
    // }
  }
  route(path) {
    this._router.navigate([path]);
  }

  keywordSearch() {
    this._router.navigate(['/dashboard/listing'], {
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


  isSelectedURL(path) {
    if ((this.currentUrl === '/' || this.currentUrl === '') && path === '/') {
      return true;
    } else if (this.currentUrl.indexOf(path) >= 0 && path !== '/') { return true; } else { return false; }
  }

  handleChange(url, type) {
    // console.log(url);
    this._router.navigate([url, type]).then(res => {
      // console.log(res);
    });
    if (url === '/auth/login') {
      this.signin.nativeElement.click();
    } else {
      this.signup.nativeElement.click();
    }
  }

  optUserType(value) {
    this._bs.setRole(value);
    localStorage.setItem('userType', value);
  }


  hideMenu() { this._headerStatusService.hideNavMenu(); }
  showMenu(slow: boolean = false) {
    setTimeout(() => {
      this._headerStatusService.showNavMenu(false);
    });
  }

  scrollMenuSm(n: number) { this._headerStatusService.changeLevelMenuSm(n); }

  changeMenuCategory(i: number) {
    this.activeCategory = i;
    this.setClassForSubcategory(i);
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
}
