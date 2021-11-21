import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ProfileManagementService } from '../../../shared/services/profile-management.service';
import { SharedService } from '../../../shared/services/shared.service';
import { BehaviorService } from '../../../shared/services/behavior.service';
import { FormPartnerGeneralComponent } from '../../../shared/form-partner-general/form-partner-general.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-partner-general',
  templateUrl: './partner-general.component.html',
  styleUrls: ['./partner-general.component.scss']
})
export class PartnerGeneralComponent implements OnInit {

  public isEditing = false;
  public profile: any;

  @ViewChild(FormPartnerGeneralComponent) private formComponent: FormPartnerGeneralComponent;

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _bs: BehaviorService,
    private _toastr: ToastrService,
    private _router: Router,
    private _uService: UniversalService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this._uService.setMeta(this._router.url, {
      title: 'Edit profile | PromptHealth',
    });    
    try {
      const user = JSON.parse(localStorage.getItem('user')); 
      this.profile = await this._profileService.getProfileDetail(user);
    }
    catch(err) { console.log(err);}
  }

  toggleEdit(){ this.isEditing = !this.isEditing; }

  onChangeImage(imageURL: string){
    /**nothing to do. */
  }

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
        this._changeDetector.detectChanges();
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
