import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GetPressReleaseQuery } from 'src/app/models/get-press-release-query';
import { IGetPressReleasesResult } from 'src/app/models/response-data';
import { SocialArticle } from 'src/app/models/social-article';
import { ISocialPost } from 'src/app/models/social-post';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { validators } from 'src/app/_helpers/form-settings';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-press-release',
  templateUrl: './press-release.component.html',
  styleUrls: ['./press-release.component.scss']
})
export class PressReleaseComponent implements OnInit {

  public latest: ISocialPost[] = null;
  public archives: ISocialPost[];
  public pageCurrent: number = 1;
  public paginators: number[][] = null;
  public pageTotal: number;
  public postTotal: number;

  private form: FormGroup;
  public isSubmitted: boolean;
  public isSending: boolean;

  get f(){ return this.form.controls; }
  
  public s3 = environment.config.AWS_S3;

  get browserS() { return this._uService.isServer || window?.innerWidth < 768; }


  paginatorShown(page: number) {
    if(!this.paginators || this.paginators.length == 0) {
      return false;
    } else if(page <= 2 || page >= (this.paginators.length - 1)) {
      return true;
    } else {
      const dist = (this.pageCurrent == 1 || this.pageCurrent == this.paginators.length) ? 2 : 1;
      if(Math.abs(page - this.pageCurrent) > dist) {
        return false;
      } else {
        return true;
      }
    }
  }

  constructor(
    private _router: Router,
    private _sharedService: SharedService,
    private _uService: UniversalService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
			userType: new FormControl('seeker', Validators.required),
      name: new FormControl('subscriber from magazine', validators.firstnameClient),
      email: new FormControl('', validators.email),
      title: new FormControl('', validators.professionalTitle),
      region: new FormControl('not set', Validators.required),
			referrer: new FormControl('other'),
    });

    if(this._uService.isBrowser) {
      const ref = this._sharedService.getReferrer();
      this.f.referrer.setValue(ref);
    }

    this._uService.setMeta(this._router.url, {
      title: 'Press release | PromptHealth',
      description: 'Find latest news from PromptHealth',
      robots: 'index, follow',
    });

    this.fetchLatest();
    // this.fetchArchives();
    
  }

  fetchLatest() {
    const query = new GetPressReleaseQuery({
      count: 4,
      skip: 0,
    });
    this._sharedService.getNoAuth('note/get-news' + query.toQueryParamsString()).subscribe((res: IGetPressReleasesResult) => {

      if(res.statusCode == 200) {
        this.latest = res.data.data.map(item => new SocialArticle(item));
        this.postTotal = res.data.total;
      }
    });
  }

  // fetchArchives() {
  //   const query = new GetPressReleaseQuery({
  //     count: 8,
  //     skip: 4,
  //   });
  //   this._sharedService.getNoAuth('note/get-news' + query.toQueryParamsString()).subscribe((res: IGetPressReleasesResult) => {
  //     if(res.statusCode == 200) {

  //     }
  //   })
  // }

  setPaginators() {
    if(!this.pageTotal || this.pageTotal <= 1) {
      this.paginators = null;
    } else {
      const paginators: {page: number; shown: boolean;}[] = [];
      for(let i=1; i<=this.pageTotal; i++) {
        let shown = false;
        if(i == 1 || i == this.pageTotal) { 
          shown = true; 
        } else {
          const dist = (this.pageCurrent == 1 || this.pageCurrent == this.pageTotal) ? 2 : 1;
          if(Math.abs(i - this.pageCurrent) > dist) {
            shown = false;
          } else {
            shown = true;
          }
        }

        paginators.push({
          page: i,
          shown: shown,
        });
      }

      this.paginators = [[]];
      paginators.forEach(p => {
        if(p.shown) {
          this.paginators[this.paginators.length - 1].push(p.page);
        } else {
          if(this.paginators[this.paginators.length - 1].length > 0) {
            this.paginators.push([]);
          }
        }
      });
    }
  }

  onSubmit() {
    this.isSubmitted = true;

    if(this.form.invalid) {
      this._toastr.error('There is an item that requires your attention');
      return;
    }

    this.isSubmitted = false;
    this.isSending = true;

    const path = 'clubhouse/create';
		this._sharedService.postNoAuth(this.form.value, path).subscribe((res: any) => {
			if(res.statusCode == 200) {
				this._toastr.success(res.message);
			}else {
				console.log(res);
				let message = res.message;
				if(res.message.match(/^E11000/)){
					message = 'This email is already registered. Please try different email address.';
				} else if(res.message.toLowerCase().match(/not a valid email/)) {
          message = 'Please enter valid email address.'
        }
				this._toastr.error(message);
			}
		}, error => {
			console.log(error);
			this._toastr.error('Something went wrong. Please try again later');
		}, () => {
      this.isSending = false;
    });
  } 
}
