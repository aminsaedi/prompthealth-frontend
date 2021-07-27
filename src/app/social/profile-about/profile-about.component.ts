import { Component, OnInit } from '@angular/core';
import { rejects } from 'assert';
import { Subscription } from 'rxjs';
import { Professional } from 'src/app/models/professional';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { slideVerticalAnimation } from 'src/app/_helpers/animations';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-about',
  templateUrl: './profile-about.component.html',
  styleUrls: ['./profile-about.component.scss'],
})
export class ProfileAboutComponent implements OnInit {

  // get profile() { return this._socialService.selectedProfile; }
  get questionnaires() { return this._qService.questionnaireOf('profilePractitioner') as QuestionnaireMapProfilePractitioner; }

  public profile: Professional;

  public isAmenityViewerShown = false;
  public isProductViewerShown = false;

  private subscription: Subscription;

  constructor(
    private _socialService: SocialService,
    private _sharedService: SharedService,
    private _qService: QuestionnaireService,
  ) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    const profile = this._socialService.selectedProfile;
    this.onProfileChanged(profile);

    this.subscription = this._socialService.selectedProfileChanged().subscribe(p => {
      this.onProfileChanged(p);
    })
  }

  onProfileChanged(p: Professional) {
    this.profile = p;
    if(p && p.isCentre && !p.triedFetchingAmenity) {
      p.markAsTriedFetchingAmenity();
      this.fetchAmenity();
    }

    if(p && p.isCentre && !p.triedFetchingProduct) {
      p.markAsTriedFetchingProduct();
      this.fetchProduct();
    }
  }

  fetchAmenity() {
    return new Promise((resolve, reject) => {
      const path = `amenity/get-all/?userId=${this.profile._id}&count=10&page=1&frontend=0`;
      this._sharedService.getNoAuth(path).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.profile.setAmenities(res.data.data);
          resolve(true);
        } else {
          reject();
        }
      }, (error) => {
        console.log(error);
        reject();
      });
    });
  }

  fetchProduct() {
    return new Promise((resolve, reject) => {
      const path = `product/get-all?userId=${this.profile.id}&count=10&page=1&frontend=0/`;
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

  openAmenityViewer() { this.isAmenityViewerShown = true; }
  closeAmenityViewer() { this.isAmenityViewerShown = false; }
  openProductViewer() { this.isProductViewerShown = true; }
  closeProductViewer() { this.isProductViewerShown = false; }

}
