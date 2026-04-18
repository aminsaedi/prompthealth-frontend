import { MapsAPILoader } from '@agm/core';
import { Component, OnInit , OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription , Subject } from 'rxjs';
import { Professional } from 'src/app/models/professional';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile-review',
  templateUrl: './profile-review.component.html',
  styleUrls: ['./profile-review.component.scss']
})
export class ProfileReviewComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get profile() { return this._socialService.selectedProfile; }
  get googleReviews() { return this.profile && this.profile.detailByGoogle ? this.profile.detailByGoogle : null };

  private subscription: Subscription;
  
  constructor(
    private _socialService: SocialService,
    private _map: MapsAPILoader,
    private _uService: UniversalService,
    private _router: Router,
  ) { }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.onProfileChanged();
    this.subscription = this._socialService.selectedProfileChanged().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onProfileChanged();
    });
  }

  onProfileChanged() {
    this.setMeta();
    if(this.profile && this.profile.isConnectedToGoogle && !this.profile.detailByGoogle && !this.profile.triedFetchingGoogleReviews)  {
      this._map.load().then(() => {
        this.profile.setGoogleReviews();
      });
    }
  }

  setMeta() {
    if(this.profile) {
      this._uService.setMeta(this._router.url, {
        title: `${this.profile.name} review | PromptHealth Community`,
        description: `Read patient reviews for ${this.profile.name} on PromptHealth.` + (this.profile.rating && this.profile.ratingCount ? ` Rated ${this.profile.rating}/5 based on ${this.profile.ratingCount} reviews.` : ''),
        image: this.profile.imageFull,
        imageType: this.profile.imageType,
        imageAlt: this.profile.name,
      });  
    }
  }

}
