import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, CategoryService } from 'src/app/shared/services/category.service';
import { slideHorizontalReverseAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'app-header-social',
  templateUrl: './header-social.component.html',
  styleUrls: ['./header-social.component.scss'],
  animations: [slideHorizontalReverseAnimation],
})
export class HeaderSocialComponent implements OnInit {

  public isMenuSmShown: boolean = false; 
  public topics: Category[] = [];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _location: Location,
    private _catService: CategoryService,
  ) { }

  iconOf(topic: Category): string {
    return this._catService.iconOf(topic);
  }

  ngOnInit(): void {

    this._route.queryParams.subscribe((param: {menu: 'show'}) => {
      this.isMenuSmShown = (param.menu == 'show') ? true : false;
    });


    this._catService.getCategoryAsync().then(cats => {
      this.topics = cats;
    });
  }

  hideMenuSm() {
    if(this.isMenuSmShown) {
      this._location.back();
    }
  }

  showMenuSm() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {menu: 'show'}});
  }

}