import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared/services/shared.service';
import { expandVerticalAnimation, fadeAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'app-header-magazine',
  templateUrl: './header-magazine.component.html',
  styleUrls: ['./header-magazine.component.scss'],
  animations: [fadeAnimation, expandVerticalAnimation],
})
export class HeaderMagazineComponent implements OnInit {

  public categories: any[];
  public tags: any[];

  public isTagMenuShown: boolean = false;

  constructor(
    private _sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.getCategories();
    this.getTags();
  }

  toggleTagMenu() {
    if(this.isTagMenuShown) {
      this.hideTagMenu();
    } else {
      this.showTagMenu();
    }
  }
  showTagMenu() {
    this.isTagMenuShown = true;
  }
  hideTagMenu() {
    this.isTagMenuShown = false;
  }

  getCategories() {
    this._sharedService.getNoAuth('category/get-categories').subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.categories = res.data;
      }
    });
  }

  getTags() {
    this._sharedService.getNoAuth('tag/get-all').subscribe((res: any) => {
      if(res.statusCode === 200) {
        this.tags = res.data.data;
      }
    });
  }
}
