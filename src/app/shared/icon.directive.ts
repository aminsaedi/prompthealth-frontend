import { Directive, ElementRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { IconName } from '../models/icon-ph';

@Directive({
  selector: '[iconPh]'
})
export class IconDirective implements OnInit {

  @Input() iconPh: IconName; /** icon name ex) chevron-right / women-men-health */
  @Input() stylePath1: IStylePath = {};
  @Input() stylePath2: IStylePath = {};

  constructor(
    _el: ElementRef,  
  ) {
    this.host = _el.nativeElement;
  }

  ngOnChanges(e: SimpleChanges) {
    if(e.iconPh && (e.iconPh.currentValue != e.iconPh.previousValue)) {
      if(e.iconPh.previousValue) {
        this.host.classList.remove('icon-' + e.iconPh.previousValue);
      }
      this.host.classList.add('icon-' + e.iconPh.currentValue);
    }
  }
  
  private host: HTMLElement;
  ngOnInit() {
    const p1: HTMLSpanElement = document.createElement('span');
    const p2: HTMLSpanElement = document.createElement('span');
    p1.className = 'path1';
    p2.className = 'path2';
    const sPath1 = new StylePath(this.stylePath1);
    const sPath2 = new StylePath(this.stylePath2);

    Object.keys(sPath1).forEach(s => {
      p1.style[s] = sPath1[s];
    });

    Object.keys(sPath2).forEach(s => {
      p2.style[s] = sPath2[s];
    });
    this.host.appendChild(p1);
    this.host.appendChild(p2);
  }
}

interface IStylePath {
  color?: string,
  opacity?: number,
}

class StylePath implements IStylePath {
  public color: string;
  public opacity: number;

  constructor(style: IStylePath = {}) {
    this.color = style.color || null;
    this.opacity = style.opacity || null;
  }
}