import { Component, Input, OnInit } from '@angular/core';

/* Ids for aria-controls. Only uniqueness within a page matters: the server's
 * count runs on from one request to the next, and the browser, which renders
 * the page again from scratch, starts its own. */
let nextAnswerId = 0;

@Component({
  selector: 'faq-item',
  templateUrl: './faq-item.component.html',
  styleUrls: ['./faq-item.component.scss'],
})
export class FaqItemComponent implements OnInit {

  @Input() data: IFAQItem;
  /* 4 is what /faq and /for-practitioners have always rendered, and they keep
   * it. A growth landing puts its questions straight under an H2, so it asks
   * for 3 rather than skip a level in the outline. */
  @Input() headingLevel: 3 | 4 = 4;

  public readonly answerId = 'faq-answer-' + (++nextAnswerId);

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
  category?: string;
}
