import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'card-dummy',
  templateUrl: './card-dummy.component.html',
  styleUrls: ['./card-dummy.component.scss']
})
export class CardDummyComponent implements OnInit {

  @Input() showImage: boolean = true;
  
  constructor() { }

  ngOnInit(): void {
  }

}
