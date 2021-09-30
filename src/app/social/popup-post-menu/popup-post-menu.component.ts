import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ISocialPost } from 'src/app/models/social-post';
import { ModalService } from 'src/app/shared/services/modal.service';
import { EditorService } from '../editor.service';

@Component({
  selector: 'popup-post-menu',
  templateUrl: './popup-post-menu.component.html',
  styleUrls: ['./popup-post-menu.component.scss']
})
export class PopupPostMenuComponent implements OnInit {

  @Input() post: ISocialPost;
  @Output() onClose = new EventEmitter<void>();

  constructor(
    private _modalService: ModalService,
    private _editorService: EditorService,
    private _router: Router,
    private _location: Location,
  ) { }

  ngOnInit(): void {
  }

  hidePopup(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.onClose.emit();
  }

  deleteContent(e: Event) {
    this.hidePopup(e);
    this._modalService.show('delete-post-alert', this.post);
  }

  editContent(e: Event) {
    this.hidePopup(e);
    this._editorService.setData(this.post.decode());
    this.markCurrentPosition();

    const route = 
      this.post.isArticle ?  ['/community/editor/article', this.post._id] :
      this.post.isEvent ? ['/community/editor/event', this.post._id] :
      this.post.isNote ? ['community/editor/note', this.post._id] : 
      ['community/editor/article', this.post._id];

    this._router.navigate(route);
  }

  markCurrentPosition() {
    this._location.replaceState(this._location.path() + '#' + this.post._id);
  }
}
