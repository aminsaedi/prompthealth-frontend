import { Component, Input, OnInit } from '@angular/core';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'faq-item',
  templateUrl: './faq-item.component.html',
  styleUrls: ['./faq-item.component.scss'],
  animations: [expandVerticalAnimation],
})
export class FaqItemComponent implements OnInit {

  @Input() data: IFAQItem;

  constructor() { }

  ngOnInit(): void {
  }

  open() {
    this.data.opened = true;
  }

  toggleState(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.data.opened = !this.data.opened;
  }

}

export interface IFAQItem {
  q: string;
  a: string;
  opened: boolean;
}