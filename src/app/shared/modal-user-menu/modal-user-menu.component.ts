import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ModalService } from '../services/modal.service';
import { SharedService } from '../services/shared.service';
import { ProService } from '../services/pro.service';
import { UniversalService } from '../services/universal.service';

@Component({
  selector: 'modal-user-menu',
  templateUrl: './modal-user-menu.component.html',
  styleUrls: ['./modal-user-menu.component.scss']
})
export class ModalUserMenuComponent implements OnInit, OnDestroy {

  @Input() staySamePageWhenLogout: boolean = true;

  get user() { return this._profileService.profile; }
  get userRole() { return this.user ? this.user.role : null; }
  get userId() { return this.user ? this.user._id : ''; }
  get userCoverImage() { return this.coverImageTemp ? this.coverImageTemp : this.user ? this.user.coverImage : ''; };
  get userProfileImage() { return this.profileImageTemp ? this.profileImageTemp : this.user ? this.user.profileImageFull : ''; };
  /* Company plans are arranged by conversation now; /plans/product is gone. */
  get linkToPlan(): string[] { return this.user?.role == 'P' ? ['/contact-us'] : ['/plans']; }
  get eligibleToUpgradePlan() { return !!(this.user && (this.user.isProvider || this.user.isP) && !this.user.isPaid); }

  public isUploading = false;
  /* Whether a practitioner or clinic is a Pro member; null until asked, which
   * happens when the menu opens. */
  public isPro: boolean = null;
  private isOpen = false;
  private destroy$ = new Subject<void>();

  private coverImageTemp: string;
  private profileImageTemp: string;

  @ViewChild('inputCoverImage') private inputCoverImage: ElementRef;
  @ViewChild('inputProfileImage') private inputProfileImage: ElementRef;

  constructor(
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _pro: ProService,
    private _uService: UniversalService,
  ) { }

  /* Asked each time the menu opens, so an upgrade made since shows, and
   * again once the sign-in check ends if the menu opened before it did (a
   * reload with ?modal=user-menu). A failure shows nothing rather than a
   * wrong answer. */
  onStateChanged(state: string) {
    this.isOpen = state === 'open';
    if (this.isOpen) { this.checkPro(); }
  }

  ngOnInit(): void {
    this._profileService.loginStatusChanged().pipe(takeUntil(this.destroy$)).subscribe(status => {
      if (status === 'loggedIn' && this.isOpen) { this.checkPro(); }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPro() {
    if (!this._uService.isBrowser || !this.user || !this.user.isProvider) { return; }
    this._pro.me().pipe(takeUntil(this.destroy$)).subscribe(me => this.isPro = !!(me && me.isPro), () => this.isPro = null);
  }

  
  onClickUserMenuItem(route: string[]) {
    this._modalService.hide(true, route);
  }

  onClickUserMenuItemLogout() {
    this._sharedService.logout(!this.staySamePageWhenLogout);
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
    this.user.update({'cover': image});
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
    this.user.update({'profileImage': image});
  }



}
