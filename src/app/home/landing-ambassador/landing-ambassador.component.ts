import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IUserDetail } from 'src/app/models/user-detail';
import { ButtonGuidelineComponent } from 'src/app/shared/button-guideline/button-guideline.component';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { environment } from 'src/environments/environment';

declare let gtag: Function;

@Component({
  selector: 'app-landing-ambassador',
  templateUrl: './landing-ambassador.component.html',
  styleUrls: ['./landing-ambassador.component.scss']
})
export class LandingAmbassadorComponent implements OnInit {

  // public ambassadorCode = 'fyCfz2Hm';
  public faceType: FaceType = null;
  public practitionerName = ' ';
  public practitionerId: string;
  public user: IUserDetail;
  public isLinkCopied = false;
  public FRONTEND_URL = location.origin || 'https://prompthealth.ca';
  public ambassador: IUserDetail;
  public AWS_S3 = environment.config.AWS_S3;

  private canvas: HTMLElement;
  private disableAnalytics: boolean = environment.config.disableAnalytics;

  @ViewChild('referralLink') private elLink: ElementRef;
  @ViewChild(ButtonGuidelineComponent) private buttonGuideLine: ButtonGuidelineComponent;

  @HostListener('window:scroll') windowScroll() {
    if (this.canvas) {
      this.canvas.style.top = Math.floor(window.scrollY * 2 / 3) + 'px';
    }
  }

  constructor(
    private _el: ElementRef,
    private _sharedService: SharedService,
    private _route: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    private _router: Router,
    private _uService: UniversalService,
  ) {
  }

  ngOnInit(): void {
    const user = this._uService.localStorage.getItem('user');
    if (user) {
      this.user = JSON.parse(user);
    }

    this.canvas = this._el.nativeElement.querySelector('.canvas');

    this._route.data.subscribe((data: { type: FaceType }) => {
      this.faceType = data.type;

      this._uService.setMeta(
        this._router.url,
        (this.faceType == 'provider') ? {
          title: 'Join Ambassador Program | PromptHealth',
          description: 'Join the movement to help people connect with medical and holistic services based on individualized needs quick and easily. You will also get credits from us.',
        } : {
          title: 'Welcome to PromptHealth',
          description: 'PromptHealth is an application that connects people to Canadian accredited medical and holistic health services.',
        }
      );


      // if(data.type == 'practitioner'){
      //   this.setCouponDetail(this.ambassadorCode);
      // }
    });

    // this._route.queryParams.subscribe((data: { id: string }) => {
    //   if (data.id && this.faceType == 'client') {
    //     this.practitionerId = data.id;
    //     this.getUserDetail();
    //   }
    // });

    this._route.params.subscribe((data: {id: string}) => {
      if(data.id && this.faceType == 'client') {
        this.practitionerId = data.id;
        this.getUserDetail();
      }
    });
  }

  ngAfterViewInit() {
    this._route.queryParams.subscribe((data: {mediakit: string}) => {
      if(typeof data.mediakit == 'string') {
        this.buttonGuideLine.openModal();
      }
    });
  }

  copyLink() {
    const el: HTMLInputElement = this.elLink.nativeElement;
    el.select();
    el.setSelectionRange(0, 9999);
    document.execCommand('copy');
    this.isLinkCopied = true;

    setTimeout(() => {
      this.isLinkCopied = false;
      this._changeDetector.detectChanges();
    }, 3000);
  }

  // setCouponDetail(code: string) {
  //   this._sharedService.get('user/get-coupon/' + code).subscribe((res: any) => {
  //     if(res.statusCode === 200){
  //       sessionStorage.setItem('stripe_coupon_code', JSON.stringify(res.data));
  //     }else {
  //       console.log(res.message);
  //     }
  //   }, error => {
  //     console.log(error);
  //   });
  // }

  getUserDetail() {
    const path = `user/get-ambassador/${this.practitionerId}`;

    this._sharedService.getNoAuth(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        if (res.data.length > 0) {
          const provider: IUserDetail = res.data[0];
          // console.log(provider);
          this.ambassador = provider;
          // console.log(this.practitionerName);
        } else {
          this.navigate404();
        }
      } else {
        this.navigate404();
        console.log(res.message);
      }
    }, err => {
      this.navigate404();
      console.log(err);
    });
  }

  navigate404() {
    this._router.navigate(['/404']);
  }

  countup() {
    const ambassadorKey = localStorage.getItem('ambassadorInvited');
    if (!ambassadorKey) {
      const path = `/user/gain-unique-invite`;
      this._sharedService.postNoAuth({ _id: this.practitionerId }, path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          localStorage.setItem('ambassadorInvited', 'invited');
        } else {
          this.navigate404();
          console.log(res.message);
        }
      }, err => {
        this.navigate404();
        console.log(err);
      });
    }
  }
}

type FaceType = 'client' | 'provider';
