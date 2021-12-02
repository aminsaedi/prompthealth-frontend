import { Component, OnInit } from '@angular/core';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-team-manager',
  templateUrl: './team-manager.component.html',
  styleUrls: ['./team-manager.component.scss']
})
export class TeamManagerComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get linkToTagStaff() { return environment.config.FRONTEND_BASE + '/join-team/' + this.user._id };

  constructor(
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
  ) { }

  ngOnInit(): void {
  }

  showEditor() {
    this._modalService.show('staff-editor');
  }
}
