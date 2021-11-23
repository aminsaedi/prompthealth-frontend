import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'card-no-content',
  templateUrl: './card-no-content.component.html',
  styleUrls: ['./card-no-content.component.scss']
})
export class CardNoContentComponent implements OnInit {

  @Input() label: 'No content!';

  constructor() { }

  ngOnInit(): void {
  }

}
