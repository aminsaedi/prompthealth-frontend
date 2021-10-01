import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { smoothWindowScrollTo } from 'src/app/_helpers/smooth-scroll';

@Component({
  selector: 'scroll-indicator',
  templateUrl: './scroll-indicator.component.html',
  styleUrls: ['./scroll-indicator.component.scss']
})
export class ScrollIndicatorComponent implements OnInit {

  @Input() scrollTo: HTMLElement;

  constructor() { }

  ngOnInit(): void {
  }

  scroll() {
    if(this.scrollTo && window) {
      const top = window.scrollY + this.scrollTo.getBoundingClientRect().top;
      smoothWindowScrollTo(top);
    }
  }

}
