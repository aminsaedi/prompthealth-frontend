import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProfileManagementService } from 'src/app/dashboard/profileManagement/profile-management.service';
import { ISocialPost } from 'src/app/models/social-post';
import { fadeFastAnimation } from 'src/app/_helpers/animations';

@Component({
  selector: 'card-item-article',
  templateUrl: './card-item-article.component.html',
  styleUrls: ['./card-item-article.component.scss'],
  animations: [fadeFastAnimation,]
})
export class CardItemArticleComponent implements OnInit {

  @Input() post: ISocialPost;
  @Input() shorten: boolean = true;

  @Output() onClickButton = new EventEmitter<string>();

  get eligibleToShowPostMenu() {
    return !!(this.post && this.user && this.post.authorId == this.user._id)
  }
  get user() {
    return this._profileService.user;
  }

  public isPopupPostMenuShown = false;

  constructor(
    private _location: Location,
    private _profileService: ProfileManagementService,
  ) { }

  ngOnInit(): void {
  }

  _onClickButton(e: Event, buttonName: string) {
    e.stopPropagation();
    e.preventDefault();
    this.isPopupPostMenuShown = true;
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }

  onPopupPostMenuClosed() {
    this.isPopupPostMenuShown = false;
  }
  

}
