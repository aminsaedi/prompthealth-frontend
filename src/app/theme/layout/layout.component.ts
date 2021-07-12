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
  public onMagazine: boolean = false;
  public onSocial: boolean = false;

  constructor(
    private _router: Router,
  ) {

    this._router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        const regexHideFooter = /(dashboard)|(page\/products)|(\/community)/;
        this.showFooter = !evt.url.match(regexHideFooter);
  
        this.onMagazine = evt.url.match(/magazines|blogs/) ? true : false;  
        this.onSocial = evt.url.match(/community/) ? true : false;
      }
    });
  }
}
