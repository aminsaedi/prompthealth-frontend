import { Component, OnInit } from '@angular/core';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'alert-not-approved',
  templateUrl: './alert-not-approved.component.html',
  styleUrls: ['./alert-not-approved.component.scss'],
  animations: [expandVerticalAnimation],
})
export class AlertNotApprovedComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get isMessageShown() { return this.user && !this.user.isApproved && this.isMessageShownIfNeeded; }
  
  private isMessageShownIfNeeded: boolean;

  constructor(
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
  ) { }

  ngOnInit(): void {
    this.isMessageShownIfNeeded = !this._uService.sessionStorage.getItem('hide_alert_being_approved');
  }

  onClickAlertBeingApproved() {
    this._uService.sessionStorage.setItem('hide_alert_being_approved', 'true');
    this.isMessageShownIfNeeded = false;
  }

}
