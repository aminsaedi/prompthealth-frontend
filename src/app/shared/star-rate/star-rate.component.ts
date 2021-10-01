import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'star-rate',
  templateUrl: './star-rate.component.html',
  styleUrls: ['./star-rate.component.scss']
})
export class StarRateComponent implements OnInit {

  @Input() rate: number = 0;
  @Input() margin: string = 'regular' /** regular | big | small | none */
  @Input() simple: boolean = false;
  @Input() size: string = 'regular'; /** regular | big | small | smaller*/
  @Input() sign: string = 'star-filled'; /** star-filled | dollar */
  @Input() showActiveOnly: boolean = true;
  @Input() color: string = null;
  
  constructor() { }

  get iconMargin() {
    const c = [];
    switch(this.margin){
      case 'regular': c.push('mr-2'); break;
      case 'big': c.push('mr-3'); break;
      case 'small': c.push('mr-1'); break;
    }
    return c.join(' ');
  }

  iconActive(i: number){
    return (i <= this.rate) ? 'active' : 'inactive';
  }

  ngOnInit(): void {
  }

  ngOnChanges(){}

}
