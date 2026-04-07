import { isPlatformBrowser, Location } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
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
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }


  ngOnInit(): void {
  }

  goback() {
    if (!isPlatformBrowser(this.platformId)) { return; }
    const state = this._location.getState() as any;
    if(state && state.navigationId == 1 && !!this.link) {
      this._router.navigate(this.link, {replaceUrl: this.replaceUrl});
    } else {
      this._location.back();
    }
  }
}
