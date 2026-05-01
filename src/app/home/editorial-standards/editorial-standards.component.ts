import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-editorial-standards',
  templateUrl: './editorial-standards.component.html',
  styleUrls: ['./editorial-standards.component.scss']
})
export class EditorialStandardsComponent implements OnInit {

  constructor(
    private _router: Router,
    private _uService: UniversalService,
  ) {}

  ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Editorial Standards & Practitioner Verification | PromptHealth',
      description: 'Learn how PromptHealth verifies healthcare practitioners, maintains content quality standards, and ensures the accuracy of health information on our platform.',
    });
  }
}
