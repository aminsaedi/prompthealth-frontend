import { Directive, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { UniversalService } from './services/universal.service';

@Directive({
  selector: '[intersectionObserver]'
})
export class IntersectionObserverDirective {

  @Input() rootMargin: string = '-100px 0px 0px 0px';
  @Output() changeStatus = new EventEmitter<boolean>()

  private host: HTMLElement;

  constructor(
    el: ElementRef,
    private _uService: UniversalService,
  ) { this.host = el.nativeElement; }

  ngOnInit(){
    if(!this._uService.isServer){
      let observer = new IntersectionObserver(entries=>{
        var target = entries[0];
        this.changeStatus.emit(!target.isIntersecting);
      }, {
        rootMargin: this.rootMargin,
        threshold: [0]
      });
      observer.observe(this.host);
  
    }
  }
}
