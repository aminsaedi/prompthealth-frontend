import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-thanku-page',
  templateUrl: './thanku-page.component.html',
  styleUrls: ['./thanku-page.component.scss']
})
export class ThankuPageComponent implements OnInit {

  constructor(
    private _router: Router,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Thank you | PromptHealth',
    });
  }

}
