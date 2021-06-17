import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { fadeAnimation } from 'src/app/_helpers/animations';
import { smoothHorizontalScrolling } from 'src/app/_helpers/smooth-scroll';

@Component({
  selector: 'app-header-magazine',
  templateUrl: './header-magazine.component.html',
  styleUrls: ['./header-magazine.component.scss'],
  animations: [fadeAnimation],
})
export class HeaderMagazineComponent implements OnInit {

  @ViewChild('menuSm') private menuSm: ElementRef;
  public isMenuShown: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  showMenu() {
    this.isMenuShown = true;
  }
  hideMenu() {
    this.isMenuShown = false;
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
