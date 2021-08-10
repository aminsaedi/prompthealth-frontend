import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { UniversalService } from './services/universal.service';

@Directive({
  selector: '[parallax]'
})
export class ParallaxDirective {

  @Input() intensity: number = 0.5; /** 0 <= x < = 1 */

  constructor(
    private el: ElementRef,
    private _uService: UniversalService,
  ) { }

  private initialDist: number;
  private initialScrollY: number; 
  private doneInit: boolean = false;

  exists() {
    return this.el && this.el.nativeElement && !this._uService.isServer;
  }

  ngAfterContentInit() {
    if(this.exists) {
      const el = this.el.nativeElement as HTMLElement;
      el.style.opacity = '0';
    }
  }

  ngAfterViewInit() {
    console.log('afterviewinit')
    
    const el = this.el.nativeElement as HTMLElement;
    if(el && !this._uService.isServer) {
      setTimeout(() => {
        const centerViewPort = window.innerHeight / 2;
        const rectEl = el.getBoundingClientRect();
        const centerEl = rectEl.top + rectEl.height / 2;
  
        this.initialDist = centerViewPort - centerEl;
        this.initialScrollY = window.scrollY;
        this.doneInit = true;

        this.setTransform();
        el.style.transition = 'opacity 400ms';
        el.style.opacity = '1';
      }, 100);
    }
  }

  @HostListener('window:scroll', ['$event']) windowScroll(e: Event) {
    if(this.doneInit) {
      this.setTransform();
    }
  }

  setTransform() {
    const el = this.el.nativeElement as HTMLElement;

    const scroll = window.scrollY - this.initialScrollY;
    const move = (this.initialDist + scroll) * this.intensity;

    el.style.marginTop = move + 'px';
  }

}
