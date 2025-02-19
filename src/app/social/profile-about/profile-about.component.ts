import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmbedVideoService } from 'ngx-embed-video';
import { Subscription } from 'rxjs';
import { Partner } from 'src/app/models/partner';
import { Professional } from 'src/app/models/professional';
import { IGetStaffsResult } from 'src/app/models/response-data';
import { Staff } from 'src/app/models/staff';
import { ModalService } from 'src/app/shared/services/modal.service';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-about',
  templateUrl: './profile-about.component.html',
  styleUrls: ['./profile-about.component.scss'],
})
export class ProfileAboutComponent implements OnInit {

  get questionnaires() { return this._qService.questionnaireOf('profilePractitioner') as QuestionnaireMapProfilePractitioner; }
  get profileAsPartner() { return this.profile as Partner; }
  get selectedStaff(): Staff { return this._modalService.data; }

  public profile: Professional | Partner;

  // public isAmenityViewerShown = false;
  public isProductViewerShown = false;
  public isPartnerViewerShown = false;

  public videos: HTMLIFrameElement[];

  private subscription: Subscription;
  private selectedStaffIds = [];

  constructor(
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _qService: QuestionnaireService,
    private _uService: UniversalService,
    private _router: Router,
    private _embedService: EmbedVideoService,
    private _modalService: ModalService,
  ) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    const profile = this._socialService.selectedProfile;
    this.onProfileChanged(profile);

    this.subscription = this._socialService.selectedProfileChanged().subscribe(p => {
      this.onProfileChanged(p);
    });
  }

  onProfileChanged(p: Professional | Partner) {
    this.profile = p;
    this.setMeta();

    this.createIframesForVideo();

    // if(p && p.isC && !p.triedFetchingAmenity) {
    //   p.markAsTriedFetchingAmenity();
    //   this.fetchAmenity();
    // }

    if(p && p.isC && !p.triedFetchingProduct) {
      p.markAsTriedFetchingProduct();
      this.fetchProduct();
    }

    if(p && p.eligibleFeatureStaffs && !p.doneInitStaffs) {
      this.fetchStaffs();
    }
  }

  setMeta() {
    if(this.profile) {
      const typeOfProvider = this._qService.getSelectedLabel(this.questionnaires.typeOfProvider, this.profile.allServiceId);
      const serviceDelivery = this._qService.getSelectedLabel(this.questionnaires.serviceDelivery, this.profile.serviceOfferIds);
      this._uService.setMeta(this._router.url, {
        title: this.profile.isSA ? `${this.profile.name} | PromptHealth Community`
          : `${this.profile.name} in ${this.profile.city}, ${this.profile.state} | PromptHealth Community`,
        description: this.profile.isSA ? this.profile.description
          : `${this.profile.name} is ${typeOfProvider.join(', ')} offering ${serviceDelivery.join(', ')}.`,
        image: this.profile.imageFull,
        imageType: this.profile.imageType,
        imageAlt: this.profile.name,
      });  
    }
  }

  createIframesForVideo() {
    this.videos = [];
    this.profile?.videos.forEach(v => {
      const iframe: HTMLIFrameElement = this._embedService.embed(v.url);
      if(iframe) {
        iframe.title = v.title;
        this.videos.push(iframe);  
      }
    });
  }

  // fetchAmenity() {
  //   return new Promise((resolve, reject) => {
  //     const path = `amenity/get-all/?userId=${this.profile._id}&count=20&page=1&frontend=0`;
  //     this._sharedService.getNoAuth(path).subscribe((res: any) => {
  //       if (res.statusCode === 200) {
  //         this.profile.setAmenities(res.data.data);
  //         resolve(true);
  //       } else {
  //         reject();
  //       }
  //     }, (error) => {
  //       console.log(error);
  //       reject();
  //     });
  //   });
  // }

  fetchProduct() {
    return new Promise((resolve, reject) => {
      const path = `product/get-all?userId=${this.profile.id}&count=20&page=1&frontend=0/`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.profile.setProducts(res.data.data);
          resolve(true);
        } else {
          reject()
        }
      }, error => {
        console.log(error);
        reject();
      });  
    })
  }

  fetchStaffs() {
    return new Promise((resolve, reject) => {
      const path = `staff/get-by-center/${this.profile._id}`;
      this._sharedService.getNoAuth(path).subscribe((res: IGetStaffsResult) => {
        if(res.statusCode == 200) {
          this.profile.setStaffs(res.data);
          resolve(true);  
        } else {
          console.log(res.message);
          reject();
        }
      }, error => {
        console.log(error);
        reject();
      });
    });
  }

  countupSocial(type: string) {
    this._sharedService.postNoAuth({
      _id: this.profile._id,
      type,
    }, 'user/update-social-count').subscribe((res) => {
    });
  }


  isStaffSelected(p: Professional) {
    return !!(this.selectedStaffIds.indexOf(p._id) >= 0);
  }

  onClickStaffDescription(p: Professional) {
    const idx = this.selectedStaffIds.findIndex(id => id == p._id);
    if(idx >= 0) {
      this.selectedStaffIds.splice(idx, 1);
    } else {
      this.selectedStaffIds.push(p._id);
    }
  }

  showModalStaticStaff(data: Staff) {
    this._modalService.show('team-member', data);
  }

  // openAmenityViewer() { this.isAmenityViewerShown = true; }
  // closeAmenityViewer() { this.isAmenityViewerShown = false; }
  openProductViewer() { this.isProductViewerShown = true; }
  closeProductViewer() { this.isProductViewerShown = false; }
  openPartnerViewer() { this.isPartnerViewerShown = true; }
  closePartnerViewer() { this.isPartnerViewerShown = false; }

}
