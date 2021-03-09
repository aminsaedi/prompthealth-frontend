import { Component, OnInit } from '@angular/core';
import { ProfileManagementService } from '../profile-management.service';
import { FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-my-social',
  templateUrl: './my-social.component.html',
  styleUrls: ['./my-social.component.scss']
})
export class MySocialComponent implements OnInit {

  public profile: any;
  public isEditing: boolean;
  public isSubmitted: boolean = false;
  public target: {type: string, link: string} = null;

  public form = new FormControl('', [
    Validators.pattern("https?://[\\w!\\?/\\+\\-_~=;\\.,\\*&@#\\$%\\(\\)'\\[\\]]+"),
    Validators.required
  ]);
  
  constructor(
    private _pService: ProfileManagementService,
    private _toastr: ToastrService,
    private _sharedService: SharedService,
  ) { }


  async ngOnInit() {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    this.profile = await this._pService.getProfileDetail(userInfo._id);
  }

  isActive(type: string){
    const item = this.getSocialItem(type);
    return item ? true : false;
  }

  getSocialItem(type: string){
    let item = null;

    if(this.profile && this.profile.socialLinks){
      for(let s of this.profile.socialLinks){
        if(s.type == type){
          item = s;
          break;
        }
      }
    }
    return item;
  }

  toggleEditMode(type: string){
    this.isSubmitted = false;

    if(this.target && this.target.type == type){
      this.target = null;
      this.isEditing = false;      
    }else{
      this.isEditing = true;

      const item = this.getSocialItem(type);
      this.target = item ? item : {type: type, link: null};

      this.form.setValue(this.target.link);
    }
  }

  onSubmit(){
    this.isSubmitted = true;
    if(this.form.invalid){
      this._toastr.error('There is an item that requires your attention.');
      return;
    }
    const items = this.profile.socialLinks || [];
    
    const item = this.getSocialItem(this.target.type);
    if(item){
      item.link = this.form.value;
    }else{
      items.push({type: this.target.type, link: this.form.value});
    }
    this.profile.socialLinks = items;
    this.update();
  }

  onClear(){
    if(this.profile && this.profile.socialLinks){
      for(let i=0; i<this.profile.socialLinks.length; i++){
        if(this.profile.socialLinks[i].type == this.target.type){
          this.profile.socialLinks.splice(i, 1);
          break;
        }
      }
    }
    this.form.setValue('');
    this.update();
  }

  update(){
    const data = {
      _id: this.profile._id,
      socialLinks: this.profile.socialLinks,
    }

    this._sharedService.loader('show');
    this._sharedService.post(data, 'user/updateProfile').subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.profile = res.data;
        this._toastr.success(res.message);
        // this.editFields = false;
        // this._bs.setUserData(res.data);
      } else {
        // this.toastr.error(res.message);
      }

      this._sharedService.loader('hide');
    }, err => {
      this._sharedService.loader('hide');
      this._toastr.error('There are some errors, please try again after some time !', 'Error');
    });

  }
}
