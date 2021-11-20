import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { IGetStaffsResult } from 'src/app/models/response-data';
import { Staff } from 'src/app/models/staff';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-team-viewer',
  templateUrl: './team-viewer.component.html',
  styleUrls: ['./team-viewer.component.scss']
})
export class TeamViewerComponent implements OnInit {

  get user() { return this._profileService.profile; }

  public isLoading = false;

  constructor(
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _router: Router,
    private _uService: UniversalService,
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
  ) { }

  ngOnInit(): void {
    if(this.user.eligibleToManageTeam && !this.user.doneInitStaffs) {
      this.fetchStaffList();
    }
  }

  fetchStaffList() {
    const path = `staff/get-by-center/${this.user._id}`;
    this.isLoading = true;
    this._sharedService.getNoAuth(path).subscribe((res: IGetStaffsResult) => {
      this.isLoading = false;
      if (res.statusCode === 200) {
        res.data.forEach(item => { this.user.setStaff(item); });
      } else {
        this.user.setStaffs([]);
      }
    }, err => {
      console.log(err);
      this.isLoading = false;
      this.user.setStaffs([]);
    });
  }

  showEditor(data: Staff = null) {
    this._modalService.show('staff-editor', data);
  }

  showMenu(staff: Staff) {
    this._modalService.show('staff-menu', staff);
  }
}
