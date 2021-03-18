import { Directive, ElementRef, Output, EventEmitter, Input } from '@angular/core';

@Directive({
  selector: '[intersectionObserver]'
})
export class IntersectionObserverDirective {

  @Input() rootMargin: string = '-100px 0px 0px 0px';
  @Output() changeStatus = new EventEmitter<boolean>()

  private host: HTMLElement;

  constructor(el: ElementRef) { this.host = el.nativeElement; }

  ngOnInit(){
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
