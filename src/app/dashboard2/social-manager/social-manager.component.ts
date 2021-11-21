import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ISaveProfileResult } from 'src/app/models/response-data';
import { IUserDetail } from 'src/app/models/user-detail';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'app-social-manager',
  templateUrl: './social-manager.component.html',
  styleUrls: ['./social-manager.component.scss']
})
export class SocialManagerComponent implements OnInit {

  get selectedSocial() { return this._modalService.data; }
  get user() { return this._profileService.profile; }

  socialLinkOf(type: string): IUserDetail['socialLinks'][0] {
    return this.user.socialLinks?.find(item => item.type == type);
  }

  hasSocialLinkOf(type: string): boolean {
    return this.user.socialLinks?.findIndex(item => item.type == type) >= 0;
  }

  public isUploading = false;
  public isEditorSubmitted = false;

  public formEditor =new FormControl('', validators.socialLink);

  constructor(
    private _modalService: ModalService,
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,

  ) { }

  ngOnInit(): void {
  }

  showEditor(type: string) {
    this._modalService.show('social-editor', {_id: type});
    this.initEditor();
  }

  showMenu(data: IUserDetail['socialLinks'][0]){
    this._modalService.show('social-menu', data);
  }

  initEditor() {
    this.isEditorSubmitted = false;
    this.formEditor.setValue('');
  }

  async onSubmitEditor() {
    this.isEditorSubmitted = true;
    if(this.formEditor.invalid) {
      this._toastr.error('There is an item that requires your attention');
      return;
    }

    const newSocialLink = {
      type: this.selectedSocial._id,
      link: this.formEditor.value,
    }

    const socialLinks = Array.from(this.user.socialLinks);
    socialLinks.push(newSocialLink);

    try {
      await this.update(socialLinks);
      this._toastr.success('Connected to social account successfully.')
      this._modalService.hide();
    } catch (error) {
      this._toastr.error('Something went wrong. Please try again.');
    }

  }

  async removeSocial(data: IUserDetail['socialLinks'][0]) {
    this.isUploading = true;
    const socialLinks = this.user.socialLinks.filter(item => item._id != data._id);

    try {
      await this.update(socialLinks);
      this._toastr.success('Disconnected successfully');
      this._modalService.hide();
    } catch (error) {
      this._toastr.error('Something went wrong. Please try again.');
    }
  }

  update(socialLinks: IUserDetail['socialLinks']): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = {
        _id: this.user._id,
        socialLinks: socialLinks,
      }
  
      this.isUploading = true;
      this._sharedService.post(payload, 'user/updateProfile').subscribe((res: ISaveProfileResult) => {
        this.isUploading = false;
        if(res.statusCode == 200) {
          this.user.update({socialLinks: res.data.socialLinks});
          resolve();
        } else {
          console.log(res.message);
          reject();
        }
      }, error => {
        console.log(error);
        reject();
      })
    });
  }
}
