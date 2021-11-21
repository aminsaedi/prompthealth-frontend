import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'form-item-comment',
  templateUrl: './form-item-comment.component.html',
  styleUrls: ['./form-item-comment.component.scss']
})
export class FormItemCommentComponent implements OnInit {

  @Input() controller: FormControl;
  @Input() disabled: boolean= false;
  @Input() option: IFormCommentOption = {};

  @Output() onCancel = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();


  get userImage() { return this.user ? this.user.profileImage : ''; }
  get user() { return this._profileService.profile; }

  public _option: FormCommentOption;

  @ViewChild('submit') private buttonSubmit: ElementRef;

  constructor(
    private _profileService: ProfileManagementService,
    private _modalService: ModalService,
  ) { }

  ngOnInit(): void {
    if(!this.controller) {
      console.error('Error! controller required');
    }
  
    this._option = new FormCommentOption(this.option);
  }

  onBeforeInput(e: InputEvent) {
    if(e.inputType.match('format')) {
      e.preventDefault();
    }
    if(e.inputType.match(/insert(Paragraph|LineBreak)/)) {
      e.preventDefault();
      if(this.buttonSubmit) {
        (this.buttonSubmit.nativeElement as HTMLInputElement).click();
      }
    }
  }
  
  onInput(e: InputEvent) {
    let val = this.controller.value;
    // for android
    //// cannot detect insertParagraph sometime on android.
    //// if new paragraph is inserted, remove it and focus editor.
    if(val.match(/<div>(<br>)?<\/div>/)) {
      val = val.replace(/<div>(<br>)?<\/div>/, '');
      this.controller.setValue(val);
      if(this.buttonSubmit) {
        (this.buttonSubmit.nativeElement as HTMLInputElement).click();
      }
    }
  }

  onClickCancel(e: Event) {
    this.stopPropagation(e);
    this.onCancel.emit();
  }

  onClickSubmit(e: Event) {
    this.stopPropagation(e);
    this.onSubmit.emit();
  }

  onClickButtonLogin() {
    this._modalService.show('login-menu');
  }

  stopPropagation(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

}


interface IFormCommentOption {
  hideCancel?: boolean;
}

class FormCommentOption implements IFormCommentOption {
  get hideCancel() { return !!(this.data.hideCancel === true) }

  constructor(private data: IFormCommentOption) {}
}