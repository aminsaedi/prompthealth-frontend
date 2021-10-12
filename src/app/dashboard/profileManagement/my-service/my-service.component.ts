import { Component, OnInit, ViewChildren, ViewChild, QueryList } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';
import { BehaviorService } from '../../../shared/services/behavior.service';
import { CategoryService } from '../../../shared/services/category.service';
import { Questionnaire, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { IUserDetail } from 'src/app/models/user-detail';
import { ProfileManagementService } from '../profile-management.service';
import { CheckboxSelectionItem, FormItemCheckboxGroupComponent } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { validators } from 'src/app/_helpers/form-settings';
import { FormItemCustomerHealthComponent } from 'src/app/shared/form-item-customer-health/form-item-customer-health.component';
import { FormItemServiceComponent } from 'src/app/shared/form-item-service/form-item-service.component';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-my-service',
  templateUrl: './my-service.component.html',
  styleUrls: ['./my-service.component.scss']
})
export class MyServiceComponent implements OnInit {

  public profile: IUserDetail;
  public roles = '';
  public isDisabled: boolean = true;

  constructor(
    private _toastr: ToastrService,
    private _bs: BehaviorService,
    private _sharedService: SharedService,
    private _profileService: ProfileManagementService,
    private _router: Router,
    private _uService: UniversalService,
  ) { }

  async ngOnInit(): Promise<void> {
    this._uService.setMeta(this._router.url, {
      title: 'Edit service | PromptHealth',
    });

    this.roles = localStorage.getItem('roles');
    const user: IUserDetail = JSON.parse(localStorage.getItem('user'));
    this.profile = await this._profileService.getProfileDetail(user);
  }

  updateFields() {
    this.isDisabled = !this.isDisabled;
  }

  onSubmit(data: IUserDetail){
    this._sharedService.loader('show');
    this._sharedService.post(data, 'user/updateProfile').subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.profile = res.data;

        this._toastr.success(res.message);
        this._bs.setUserData(res.data);
        this.isDisabled = true;
      } else {
        this._toastr.error(res.message);
      }
    }, err => {
      this._sharedService.loader('hide');
      this._toastr.error('There are some errors, please try again after some time !', 'Error');
    });
  }
}
