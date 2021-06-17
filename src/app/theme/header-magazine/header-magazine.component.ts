import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { expandVerticalAnimation, fadeAnimation } from 'src/app/_helpers/animations';
import { smoothHorizontalScrolling } from 'src/app/_helpers/smooth-scroll';

@Component({
  selector: 'app-header-magazine',
  templateUrl: './header-magazine.component.html',
  styleUrls: ['./header-magazine.component.scss'],
  animations: [fadeAnimation, expandVerticalAnimation],
})
export class HeaderMagazineComponent implements OnInit {

  @ViewChild('menuSm') private menuSm: ElementRef;
  public isMenuShown: boolean = false;
  public isCategoryShown: boolean = false;

  constructor(
    private _router: Router,
  ) { }

  ngOnInit(): void {
  }

  showMenu() {
    this.isMenuShown = true;
  }
  hideMenu() {
    this.isMenuShown = false;
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

  changeMenuTo(from: number, to: number) {
    console.log('changeMenu')
    if(this.menuSm && this.menuSm.nativeElement) {
      console.log('found menu sm')
      const el: HTMLElement = this.menuSm.nativeElement;
      const w: number = el.clientWidth;
      const amount = (to - from) * w;
      const start = from * w;
      
      smoothHorizontalScrolling(el, 180, amount,  start);
    }
  }
}
