import { Component, Input, OnInit } from '@angular/core';
import { Blog } from 'src/app/models/blog';

@Component({
  selector: 'list-event',
  templateUrl: './list-event.component.html',
  styleUrls: ['./list-event.component.scss']
})
export class ListEventComponent implements OnInit {

  get headliner() {
    let res = null;
    if(this.latest && this.latest.length > 0) {
      res = this.latest[0];
    }
    return res;
  }

  @Input() latest: Blog[];
  @Input() archive: Blog[];

  constructor() { }

  ngOnInit(): void {
  }

}
