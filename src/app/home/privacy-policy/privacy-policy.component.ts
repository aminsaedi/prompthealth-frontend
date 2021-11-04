import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor(
    private _router: Router,
    private _uService: UniversalService,
  ) {}

  ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Privacy policy | PromptHealth',
    });
  }
}
