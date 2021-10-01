import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ISocialPost } from 'src/app/models/social-post';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'popup-post-menu',
  templateUrl: './popup-post-menu.component.html',
  styleUrls: ['./popup-post-menu.component.scss']
})
export class PopupPostMenuComponent implements OnInit {

  @Input() post: ISocialPost;

  get eligibleToShowPostMenu() {
    return !!(this.post && this.user && this.post.authorId == this.user._id)
  }

  get user() {
    return this._profileService.user;
  }

  public isPopupPostMenuShown = false;

  constructor(
    private _modalService: ModalService,
    private _profileService: ProfileManagementService,
    private _changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
  }

  showPopup(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.isPopupPostMenuShown = true;
    this._changeDetector.detectChanges();
  }

  hidePopup(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.isPopupPostMenuShown = false;
    this._changeDetector.detectChanges();
  }

  deleteContent(e: Event) {
    this.hidePopup(e);    
    this._modalService.show('delete-post-alert', this.post);
  }
}
