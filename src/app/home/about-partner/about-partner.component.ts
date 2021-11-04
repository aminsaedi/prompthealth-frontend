import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-about-partner',
  templateUrl: './about-partner.component.html',
  styleUrls: ['./about-partner.component.scss']
})
export class AboutPartnerComponent implements OnInit {

  constructor(
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Partner with PromptHealth',
      description: 'PromptHealth strives to partner with health and wellness focused organizations who are making an impact on the community.',
      robots: 'index, follow',
      image: `${environment.config.FRONTEND_BASE}/assets/img/about/top-partner.png`,
      imageWidth: 1094,
      imageHeight: 615,
      imageAlt: 'Partner with PromptHealth',
    });
  }

}
