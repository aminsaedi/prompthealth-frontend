import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  public showFooter = false;
  public showItems = true;
  eventKey = 1;

  @HostListener('document:click', ['$event']) clickedOutside($event) {
    this.eventKey += 1;
  }

  constructor(
    private _router: Router,
    private _sharedService: SharedService) {

    this._router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      if (evt.url.indexOf('dashboard') >= 0 || evt.url.indexOf('page/products') >= 0) {
        this.showFooter = false;
      } else {
        this.showFooter = true;
      }
    });
  }
}
