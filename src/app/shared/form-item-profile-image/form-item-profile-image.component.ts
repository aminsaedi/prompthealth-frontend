import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'form-item-profile-image',
  templateUrl: './form-item-profile-image.component.html',
  styleUrls: ['./form-item-profile-image.component.scss']
})
export class FormItemProfileImageComponent implements OnInit {

  @Input() controller: FormControl;
  @Output() onStartUploading = new EventEmitter<void>();
  @Output() onFailUploading = new EventEmitter<void>();
  @Output() onDoneUploading = new EventEmitter<string>();

  get image() {
    const img = this.imageTemp ? 
      this.imageTemp :
      this.controller?.value ? (environment.config.AWS_S3 + this.controller.value) : null; 
    return img;
  }

  public isUploading: boolean; 
  private imageTemp: string

  @ViewChild('input') private input: ElementRef;

  constructor(
  ) { }


  ngOnInit(): void {
  }

  onClickImage() {
    (this.input.nativeElement as HTMLInputElement)?.click();
  }

  onChange(image: string) {
    // console.log(image);
    this.imageTemp = image;
  }

  onStartUpload() {
    this.isUploading = true;
    this.onStartUploading.emit();
  }

  onFailUpload() {
    this.isUploading = false;
    this.imageTemp = null;
    this.onFailUploading.emit();
  }

  onDoneUpload(image: string) {
    this.isUploading = false;
    this.imageTemp = null;
    this.controller.setValue(image);
    this.onDoneUploading.emit(image);
  }

  remove() {
    this.controller.setValue(null);
    this.imageTemp = null;
  }

}
