import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Professional } from 'src/app/models/professional';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { SocialService } from '../social.service';

@Component({
  selector: 'app-profile-feed',
  templateUrl: './profile-feed.component.html',
  styleUrls: ['./profile-feed.component.scss']
})
export class ProfileFeedComponent implements OnInit {

  public profile: Professional;
  private subscription: Subscription;

  constructor(
    private _socialService: SocialService,
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
  }

}
