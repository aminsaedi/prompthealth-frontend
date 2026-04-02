import { Component, OnInit , OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ISaveProfileResult } from 'src/app/models/response-data';
import { IUserDetail } from 'src/app/models/user-detail';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-services-manager',
  templateUrl: './services-manager.component.html',
  styleUrls: ['./services-manager.component.scss']
})
export class ServicesManagerComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  get user() { return this._profileService.profile; }

  public isUploading = false;

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'My profile - Services | PromptHealth',
    })
  }

  onSubmit(data: IUserDetail){
    this.isUploading = true;
    this._sharedService.post(data, 'user/updateProfile').pipe(takeUntil(this.destroy$)).subscribe((res: ISaveProfileResult) => {
      this.isUploading = false;

      if (res.statusCode === 200) {
        this._toastr.success('Updated successfully');
        this.user.update(data);
      } else {
        this._toastr.error('Something went wrong. Please try again');
      }
    }, error => {
      this.isUploading = false;
      this._toastr.error('Something went wrong. Please try again');
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
