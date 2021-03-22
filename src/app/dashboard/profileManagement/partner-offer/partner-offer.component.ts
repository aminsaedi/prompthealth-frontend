import { Component, OnInit, ViewChild } from '@angular/core';
import { ProfileManagementService } from '../profile-management.service';
import { SharedService } from '../../../shared/services/shared.service';
import { FormPartnerOfferComponent } from '../../../shared/form-partner-offer/form-partner-offer.component';
import { ToastrService } from 'ngx-toastr';
import { BehaviorService } from '../../../shared/services/behavior.service';
import { FormPartnerGeneralComponent } from 'src/app/shared/form-partner-general/form-partner-general.component';

@Component({
  selector: 'app-partner-offer',
  templateUrl: './partner-offer.component.html',
  styleUrls: ['./partner-offer.component.scss']
})
export class PartnerOfferComponent implements OnInit {

  public isEditing = false;
  public profile: any;

  @ViewChild(FormPartnerOfferComponent) private formComponent: FormPartnerGeneralComponent;

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _bs: BehaviorService,
  ) { }

  async ngOnInit() {
    try {
      const user = JSON.parse(localStorage.getItem('user')); 
      this.profile = await this._profileService.getProfileDetail(user);
    }
    catch(err) { console.log(err);}
  }

  toggleEdit(){ this.isEditing = !this.isEditing; }

  onSubmit(){
    this.formComponent.onSubmit();
  }

  update(data: any){
    this._sharedService.loader('show');
    data._id = this.profile._id;
    this._sharedService.post(data, 'user/updateProfile').subscribe((res: any) => {
      this._sharedService.loader('hide');
      if(res.statusCode == 200){
        this._toastr.success(res.message);
        this._bs.setUserData(res.data);
        this.isEditing = false;
      }else{
        this._toastr.error(res.message);
      }
    }, error => {
      this._sharedService.loader('hide');
      console.log(error);
      this._toastr.error('There are some errors, please try again after some time.');
    });

  }
}
