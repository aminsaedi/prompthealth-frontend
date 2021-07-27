import { MapsAPILoader } from '@agm/core';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Professional } from 'src/app/models/professional';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-review',
  templateUrl: './profile-review.component.html',
  styleUrls: ['./profile-review.component.scss']
})
export class ProfileReviewComponent implements OnInit {

  public profile: Professional;
  public googleReviews: google.maps.places.PlaceResult;
  private subscription: Subscription;
  
  constructor(
    private _socialService: SocialService,
    private _map: MapsAPILoader,
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


  onProfileChanged(p: Professional) {
    this.profile = p;
    if(p && p.detailByGoogle) {
      this.googleReviews = p.detailByGoogle;
    }

    if(p && p.isConnectedToGoogle && !p.detailByGoogle && !p.triedFetchingGoogleReviews)  {
      this._map.load().then(() => {
        p.setGoogleReviews().then(result => {
          this.googleReviews = result;
        });        
      });
    }
  }
}
