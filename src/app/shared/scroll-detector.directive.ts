import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[scrollDetector]'
})
export class ScrollDetectorDirective {

  @Input() scrollDetector: boolean = false;
  @Input() direction: 'x' | 'y' = 'y';
  @Input() offset: number = 1;

  @Output() detect = new EventEmitter<void>()

  private initialPosition:[number, number];


  constructor() {}

  @HostListener('window: scroll') windowScroll(){
    if(this.scrollDetector !== false){
      if(!this.initialPosition){ this.initialPosition = [window.scrollX, window.scrollY]; }

      var p0 = (this.direction == 'x')? this.initialPosition[0] : this.initialPosition[1];
      var p1 = (this.direction) == 'x'? window.scrollX : window.scrollY;      

      if(Math.abs(p1 - p0) > this.offset){
        this.detect.emit()
        this.initialPosition = null;
      }  
    }
  }
}
