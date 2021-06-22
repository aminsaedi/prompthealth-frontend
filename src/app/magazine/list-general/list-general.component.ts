import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Blog } from 'src/app/models/blog';

@Component({
  selector: 'list-general',
  templateUrl: './list-general.component.html',
  styleUrls: ['./list-general.component.scss']
})
export class ListGeneralComponent implements OnInit {

  @Input() latest: Blog[];
  @Input() archive: Blog[];
  @Input() pageCurrent: number;
  @Input() postType: string; /** video | podcast | news |  event | post */
  @Input() paginators: number[][];

  constructor() { }

  ngOnInit(): void {
  }

}
