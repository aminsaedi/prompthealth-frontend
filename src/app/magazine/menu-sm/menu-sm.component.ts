import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { smoothHorizontalScrolling } from 'src/app/_helpers/smooth-scroll';

@Component({
  selector: 'app-menu-sm',
  templateUrl: './menu-sm.component.html',
  styleUrls: ['./menu-sm.component.scss'],
})
export class MenuSmComponent implements OnInit {

  @ViewChild('menuSm') private menuSm: ElementRef;

  constructor(
    private _location: Location,
    private _router: Router,
  ) { }

  ngOnInit(): void {
  }

  changeMenuTo(from: number, to: number) {
    if(this.menuSm && this.menuSm.nativeElement) {
      const el: HTMLElement = this.menuSm.nativeElement;
      const w: number = el.clientWidth;
      const amount = (to - from) * w;
      const start = from * w;
      
      smoothHorizontalScrolling(el, 180, amount,  start);
    }
  }

  goback() {
    this._location.back();
  }

  gonext(link: string[]) {
    this._router.navigate(link, {replaceUrl: true});
  }
}
