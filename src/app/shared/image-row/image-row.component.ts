import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'image-row',
  templateUrl: './image-row.component.html',
  styleUrls: ['./image-row.component.scss']
})
export class ImageRowComponent implements OnInit {

  @Input() images: {name?: string, url: string, desc?: string}[];
  @Input() option: {fixHeight?: boolean, col?: number, center?: boolean} = {}

  @Output() select = new EventEmitter<number>();

  get ulClass() {
    const c = [];
    if(this.option.fixHeight){ c.push('fix-height'); }
    if(!this.option.col){ c.push('nowrap'); }
    if(this.option.center) { c.push('justify-content-center'); }
    return c.join(' ');
  }
  get liClass(){ return (this.option.col) ? 'col' + this.option.col : ''; }

  constructor() { }

  ngOnInit(): void {
  }

  onClick(e: Event, i: number){
    e.preventDefault();
    e.stopPropagation();
    this.select.emit(i)
  }

}
