import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ModalService } from '../services/modal.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'modal-user-menu',
  templateUrl: './modal-user-menu.component.html',
  styleUrls: ['./modal-user-menu.component.scss']
})
export class ModalUserMenuComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get userRole() { return this.user ? this.user.role : null; }
  get userId() { return this.user ? this.user._id : ''; }
  get userCoverImage() { return this.coverImageTemp ? this.coverImageTemp : this.user ? this.user.coverImage : ''; };
  get userProfileImage() { return this.profileImageTemp ? this.profileImageTemp : this.user ? this.user.profileImageFull : ''; };


  public isUploading = false;

  private coverImageTemp: string;
  private profileImageTemp: string;

  @ViewChild('inputCoverImage') private inputCoverImage: ElementRef;
  @ViewChild('inputProfileImage') private inputProfileImage: ElementRef;

  constructor(
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
  ) { }

  ngOnInit(): void {

  }

  
  onClickUserMenuItem(route: string[]) {
    this._modalService.hide(true, route);
  }

  onClickUserMenuItemLogout() {
    this._sharedService.logout();
    this._modalService.hide();
  }

  onClickCoverImage() {
    const el: HTMLInputElement = this.inputCoverImage ? this.inputCoverImage.nativeElement : null;
    if(el) {
      el.click();
    }
  }

  onClickProfileImage() {
    const el: HTMLInputElement = this.inputProfileImage ? this.inputProfileImage.nativeElement : null;
    if(el) {
      el.click();
    }
  }

  onChangeCoverImage(image: string) {
    this.coverImageTemp = image;
  }

  onStartUploadImage() {
    this.isUploading = true;
  }

  onFailUploadCoverImage() {
    this.isUploading = false;
    this.coverImageTemp = null;
    this._toastr.error('Could not upload image. Please try again later.');
  }

  onDoneUploadCoverImage(image: string) {
    this.isUploading = false;
    this.coverImageTemp = null;
    this._profileService.update({'cover': image});
  }

  onChangeProfileImage(image: string) {
    this.profileImageTemp = image;
  }

  onFailUploadProfileImage() {
    this.isUploading = false;
    this.coverImageTemp = null;
    this._toastr.error('Could not upload image. Please try again later.');
  }

  onDoneUploadProfileImage(image: string) {
    this.isUploading = false;
    this.profileImageTemp = null;
    this._profileService.update({'profileImage': image});
  }



}
