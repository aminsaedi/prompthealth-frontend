import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-medical-disclaimer',
  templateUrl: './medical-disclaimer.component.html',
  styleUrls: ['./medical-disclaimer.component.scss']
})
export class MedicalDisclaimerComponent implements OnInit {

  constructor(
    private _router: Router,
    private _uService: UniversalService,
  ) {}

  ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Medical Disclaimer | PromptHealth',
      description: 'Information provided on PromptHealth is for general educational purposes and is not a substitute for professional medical advice, diagnosis, or treatment.',
    });
  }
}
