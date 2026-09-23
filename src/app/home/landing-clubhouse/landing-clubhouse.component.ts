import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-landing-clubhouse',
  templateUrl: './landing-clubhouse.component.html',
  styleUrls: ['./landing-clubhouse.component.scss']
})
export class LandingClubhouseComponent implements OnInit {

	public referrer: string;

  constructor(
    _fb: FormBuilder,
    _el: ElementRef,
		private _sharedService: SharedService,
		private _uService: UniversalService,
		private _router: Router,
  ) {
		this._uService.setMeta(this._router.url, {
			title: 'Newsletter | PromptHealth',
			description: 'Subscribe to receive meaningful, illuminating insight into the wins and challenges of the health and wellness industry.',
			/* On www, not the apex, which answers every request with a 301 that
			 * a scraper has to follow first. 432x360 is the file's real size. */
			image: `${environment.config.FRONTEND_BASE}/assets/img/newsletter.png`,
			imageWidth: 432,
			imageHeight: 360,
			imageAlt: 'newsletter',
			imageType: 'image/png',
		});

  }

  ngOnInit(): void {
		if(!this._uService.isServer){
			const ref = this._sharedService.getReferrer();
			this.referrer = ref;
		}
  }
}