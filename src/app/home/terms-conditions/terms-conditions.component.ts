import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../shared/services/shared.service';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent implements OnInit {

  result: any;
  title: any;
  description: any;

  constructor(
    private _router: Router,
    private _sharedService: SharedService,
    private _uService: UniversalService,
  ) {
    this._sharedService.loader('show');
    this._sharedService.get("Pages/fixTitle/t-c").subscribe((res: any) => {

      if (res.success) {
        this._sharedService.loader('hide');
        this.title = res.data.title
        this.description = res.data.description
      }
    },
      (error) => { });
  }

  ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Terms and Conditions',
    });
  }

}
