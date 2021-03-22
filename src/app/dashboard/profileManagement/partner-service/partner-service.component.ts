import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from '../profile-management.service';
import { Category, CategoryService } from '../../../shared/services/category.service';
import { SharedService } from '../../../shared/services/shared.service';
import { BehaviorService } from '../../../shared/services/behavior.service';

@Component({
  selector: 'app-partner-service',
  templateUrl: './partner-service.component.html',
  styleUrls: ['./partner-service.component.scss']
})
export class PartnerServiceComponent implements OnInit {

  public categories: Category[];
  public isEditing = false;
  public profile: any;
  private selectedServices: string[];
  private uploadedImages: string[];

  constructor(
    private _profileService: ProfileManagementService,
    private _catService: CategoryService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _bs: BehaviorService,
  ) { }

  async ngOnInit() {
    try { this.categories = await this._catService.getCategoryAsync(); }
    catch(err){ console.log(err); }

    try {
      const user = JSON.parse(localStorage.getItem('user')); 
      this.profile = await this._profileService.getProfileDetail(user);
      this.selectedServices = this.profile.services || [];
      this.uploadedImages = this.profile.image || [];
    }
    catch(err) { console.log(err);}
  }

  toggleEdit(){ this.isEditing = !this.isEditing; }

  onChangeSelectedServices(services: string[]){
    this.selectedServices = services;
  }

  onChangeUploadedImages(images: string[]){
    this.uploadedImages = images;
  }

  update(){

    if(this.selectedServices.length == 0){
      this._toastr.error('Please select at least 1 service.');
      return;
    }

    const data = {
      _id: this.profile._id, 
      services: this.selectedServices,
      image: this.uploadedImages,
    };

    this._sharedService.loader('show');
    this._sharedService.post(data, 'user/updateProfile').subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this._toastr.success(res.message);
        this._bs.setUserData(res.data);
        this.isEditing = false;
      } else {
        this._toastr.error(res.message);
      }
    }, err => {
      this._sharedService.loader('hide');
      this._toastr.error('There are some errors, please try again after some time !', 'Error');
    });
  }
}
