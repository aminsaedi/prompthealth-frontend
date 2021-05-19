import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Professional } from 'src/app/models/professional';

@Component({
  selector: 'card-practitioner',
  templateUrl: './card-practitioner.component.html',
  styleUrls: ['./card-practitioner.component.scss']
})
export class CardPractitionerComponent implements OnInit {

  @Input() data: Professional;
  @Input() showDistance: boolean = true;

  @Output() changeCompareStatus = new EventEmitter<void>()

  get p(): Professional { return this.data; }

  constructor() { }

  ngOnInit(): void {
  }

  onChangeCompareCheckbox() {
    this.changeCompareStatus.emit();
  }

}
