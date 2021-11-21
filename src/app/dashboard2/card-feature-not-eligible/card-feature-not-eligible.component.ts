import { Component, OnInit } from '@angular/core';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';

@Component({
  selector: 'card-feature-not-eligible',
  templateUrl: './card-feature-not-eligible.component.html',
  styleUrls: ['./card-feature-not-eligible.component.scss']
})
export class CardFeatureNotEligibleComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get linkToPlan() { return this.user?.role == 'P' ? ['/plans', 'product'] : ['/plans']; }

  constructor(
    private _profileService: ProfileManagementService,
  ) { }

  ngOnInit(): void {
  }

}
