import { Component, OnInit } from '@angular/core';
import { QuestionnaireAnswer, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.scss']
})
export class SitemapComponent implements OnInit {

  constructor(
    private _qService: QuestionnaireService,
  ) { }

  public typeOfProviderList: QuestionnaireAnswer[];

  ngOnInit(): void {
    this._qService.getSitemap().then(data => { 
      this.typeOfProviderList =data.typeOfProvider.answers;
    });
  }
}
