import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() bodyStyle: any;
  @Input() id: string;
  // @Input() bodyClass: any;
  @Input() option: IModalOption = {};

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
  ) { }

  public isShown: boolean = false;
  public queryParams: {[k: string]: string};
  public _option: ModalOption;

  ngOnInit(): void {
    this._option = new ModalOption(this.option);

    this._route.queryParams.subscribe((params: {modal: string}) => {
      this.queryParams = {...params};
      this.isShown = (params.modal && params.modal.length > 0 && params.modal == this.id) ? true : false;
    });
  }

  goBack() {
    const state = this._location.getState() as any;
    if(state.navigationId == 1) {
    
      this.queryParams.modal = null;
      this._router.navigate(['./'], {queryParams: this.queryParams, replaceUrl: true, relativeTo: this._route});
    } else {
      this._location.back();
    }
  }

  goNext() {
    this.queryParams.modal = null;
    this._router.navigate(['./'], {queryParams: this.queryParams, replaceUrl: true, relativeTo: this._route});
  }

}

interface IModalOption {
  expandedSm?: boolean;
}

class ModalOption implements IModalOption {

  get expandedSm() { return !!(this.data.expandedSm === true); }
  constructor(private data: IModalOption) {}
}