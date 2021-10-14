import { Component, OnInit } from '@angular/core';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { Profile } from 'src/app/models/profile';

@Component({
  selector: 'card-new-promo',
  templateUrl: './card-new-promo.component.html',
  styleUrls: ['./card-new-promo.component.scss']
})
export class CardNewPromoComponent implements OnInit {

  get userImage(): string { return this.user ? this.user.profileImage : ''; }
  get user(): Profile { return this._profileService.profile; }

  public isEditorFocused: boolean = false;

  constructor(
    private _profileService: ProfileManagementService,
  ) { }

  ngOnInit(): void {
  }

  blurEditor() {
    this.isEditorFocused = false;
  }

  onSubmit() {}

}
