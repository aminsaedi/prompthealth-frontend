import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent implements OnInit {

  constructor(
    private _router: Router,
    private _uService: UniversalService,
  ) {
  }

  ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Terms and Conditions',
    });
  }

}
