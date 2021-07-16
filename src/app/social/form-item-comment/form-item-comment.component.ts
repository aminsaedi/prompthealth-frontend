import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'form-item-comment',
  templateUrl: './form-item-comment.component.html',
  styleUrls: ['./form-item-comment.component.scss']
})
export class FormItemCommentComponent implements OnInit {

  @Input() controller: FormControl;
  @Input() option: IFormCommentOption = {};

  @Output() onCancel = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();

  public _option: FormCommentOption;

  @ViewChild('submit') private buttonSubmit: ElementRef;

  constructor() { }

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
    console.log(this.controller.invalid)
    this.onSubmit.emit();
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