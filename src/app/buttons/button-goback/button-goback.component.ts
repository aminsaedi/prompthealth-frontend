import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'button-goback',
  templateUrl: './button-goback.component.html',
  styleUrls: ['./button-goback.component.scss']
})
export class ButtonGobackComponent implements OnInit {

  @Input() buttonClass: any;
  @Input() link: string[];
  @Input() replaceUrl: boolean = false;

  constructor(
    private _location: Location,
    private _router: Router,
  ) { }
  

  ngOnInit(): void {
  }

  goback() {
    const state = this._location.getState() as any;
    if(state && state.navigationId == 1 && !!this.link) {
      this._router.navigate(this.link, {replaceUrl: this.replaceUrl});
    } else {
      this._location.back();
    }
  }
}
