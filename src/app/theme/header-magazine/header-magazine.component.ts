import { Component, OnInit } from '@angular/core';
import { expandVerticalAnimation, fadeAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'app-header-magazine',
  templateUrl: './header-magazine.component.html',
  styleUrls: ['./header-magazine.component.scss'],
  animations: [fadeAnimation, expandVerticalAnimation],
})
export class HeaderMagazineComponent implements OnInit {

  public isMenuShown: boolean = false;
  public isCategoryShown: boolean = false;

  constructor(
  ) { }

  ngOnInit(): void {
  }

  toggleCategory() {
    if(this.isCategoryShown) {
      this.hideCategory();
    } else {
      this.showCategory();
    }
  }
  showCategory() {
    this.isCategoryShown = true;
  }
  hideCategory() {
    this.isCategoryShown = false;
  }
}
