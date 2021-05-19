import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(
    private _router: Router,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Not Found | PromptHealth',
    })
  }

}
