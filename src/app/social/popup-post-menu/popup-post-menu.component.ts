import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ISocialPost } from 'src/app/models/social-post';
import { ModalService } from 'src/app/shared/services/modal.service';

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
  ) { }

  ngOnInit(): void {
  }

  hidePopup(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.onClose.emit();
  }

  deleteContent(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.hidePopup(e);
    
    this._modalService.show('delete-post-alert', this.post);
  }
}
