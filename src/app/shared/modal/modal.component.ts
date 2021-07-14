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

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
  ) { }

  public isShown: boolean = false;
  public queryParams: {[k: string]: string};

  ngOnInit(): void {
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
