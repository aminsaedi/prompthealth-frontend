import { Component, HostBinding, HostListener, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { validators } from 'src/app/_helpers/form-settings';

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
		private _toastr: ToastrService,
		private _sharedService: SharedService,
		private _uService: UniversalService,
		private _router: Router,
		private _route: ActivatedRoute,
  ) {
		this._uService.setMeta(this._router.url, {
			title: 'Newsletter | PromptHealth',
			description: 'Subscribe to receive meaningful, illuminating insight into the wins and challenges of the health and wellness industry.',
			image: 'https://prompthealth.ca/assets/img/clubhouse.png',
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