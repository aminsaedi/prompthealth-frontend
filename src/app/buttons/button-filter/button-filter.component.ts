import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'button-filter',
  templateUrl: './button-filter.component.html',
  styleUrls: ['./button-filter.component.scss']
})
export class ButtonFilterComponent implements OnInit {

  @Input() filterOn: boolean = false; 

  constructor(
    private _modalService: ModalService,
  ) { }

  ngOnInit(): void {
  }

  onClick() {
      this._modalService.show('company-filter');
  }
}
