import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/shared/services/shared.service';
import { validators } from 'src/app/_helpers/form-settings';


@Component({
  selector: 'card-new-post',
  templateUrl: './card-new-post.component.html',
  styleUrls: ['./card-new-post.component.scss']
})
export class CardNewPostComponent implements OnInit {

  get f() { return this.form.controls; }

  public isMoreShown: boolean = false;
  public imagePreview: string | ArrayBuffer;

  private form: FormGroup;
  @ViewChild('inputMedia') private inputMedia: ElementRef;

  constructor(
    private _sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      description: new FormControl('', validators.publishPostDescription),
      authorId: new FormControl(null, validators.savePostAuthorId),
      media: new FormControl(),
    });
  }

  onClickButtonMedia() {
    const el = this.inputMedia.nativeElement as HTMLInputElement;
    if(el) {
      el.click();
    }
  }

  async onSelectMedia(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if(files && files.length > 0){

      let image: {file: File | Blob, filename: string};

      try { 
        image = await this._sharedService.shrinkImageByFixedWidth(files[0], 800);
        this.f.media.setValue(image.file);
        const reader = new FileReader();
        reader.readAsDataURL(image.file);
        reader.onloadend = () => {
          this.imagePreview = reader.result;
        }
      } catch(err){
        this.f.media.setValue('');
        return;
      }
    }
  }

  onClickButtonRemoveMedia() {
    this.imagePreview = null;
    this.f.media.setValue('');
  }

  onClickButtonMore() {
    this.isMoreShown = !this.isMoreShown;
  }

}
