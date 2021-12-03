import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { GetShowcaseQuery, SaveShowcaseQuery } from 'src/app/models/get-showcase-query';
import { ICreateShowcaseResult, IGetShowcaseResult, IResponseData } from 'src/app/models/response-data';
import { Showcase } from 'src/app/models/showcase';
import { ModalStateType } from 'src/app/shared/modal/modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { minmax, validators } from 'src/app/_helpers/form-settings';
import { environment } from 'src/environments/environment';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-showcase',
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.scss']
})
export class ShowcaseComponent implements OnInit {

  get selectedShowcase(): Showcase { return this._modalService.data; }
  get user() { return this._profileService.profile; }
  
  get fEditor() { return this.formEditor.controls; }

  public minmax = minmax;
  public formEditor: FormGroup;
  public isEditorSubmitted: boolean = false;
  public isUploading: boolean = false;
  public isUploadingImage: boolean = false;
  public isLoading: boolean = false;
  public imageTempInEditor: string|ArrayBuffer;
  public s3 = environment.config.AWS_S3;

  @ViewChild('inputImage') private inputImage: ElementRef;

  constructor(
    private _modalService: ModalService,
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    if(this.user.eligibleToManageShowcase && !this.user.doneInitShowcases) {
      this.fetchShowcases();
    }

    this._uService.setMeta(this._router.url, {
      title: 'My profile - Showcase | PromptHealth',
    });
  }

  fetchShowcases() {

    const query = new GetShowcaseQuery({userId: this.user._id});
    this.isLoading = true;
    this._sharedService.get('product/get-all' + query.toQueryParamsString()).subscribe((res: IGetShowcaseResult) => {
      this.isLoading = false;
      if (res.statusCode === 200) {
        this.user.setShowcases(res.data.data);
      } else {
        console.log(res.message);
        this._toastr.error('Something wrong');
      }
    }, error => {
      this.isLoading = false;
      console.log(error);
      this._toastr.error('Something wrong');
    });
  }

  showEditor(data: Showcase = null) {
    this._modalService.show('showcase-editor', data);
  }

  showMenu(data: Showcase) {
    this._modalService.show('showcase-menu', data);
  }

  onModalEditorStateChanged(state: ModalStateType) {
    this.isEditorSubmitted = false;
    if(state == 'open') {
      this.initEditor(this.selectedShowcase);
    } else {
      this.formEditor = null;
    }
  }

  initEditor(data: Showcase = null) {
    const d = data?.decode() || null;
    this.formEditor = new FormGroup({
      title: new FormControl(d ? d.title : null, validators.showcaseName),
      price: new FormControl(d ? d.price : null, validators.showcasePrice),
      description: new FormControl(d ? d.description : null, validators.showcaseDescription),
      images: new FormControl(d?.images?.length > 0 ? Array.from(d.images) : [], validators.showcaseImages),
    });
  }

  onClickAddImage() {
    this.inputImage.nativeElement?.click();
  }

  onChangeShowcaseImage(image: string|ArrayBuffer) {
    this.imageTempInEditor = image;
  }

  onStartUploadShowcaseImage() {
    this.isUploadingImage = true;
  }

  onDoneUploadShowcaseImage(image: string) {
    this.fEditor.images.value.push(image);
    this.fEditor.images.updateValueAndValidity();
    this.imageTempInEditor = null;
    this.isUploadingImage = false;
  }

  onFailUploadShowcaseImage() {
    this.imageTempInEditor = null;
    this.isUploadingImage = false;
  }

  removeShowcaseImage(i: number) {
    let images = this.fEditor.images.value;
    images.splice(i,1);
    this.fEditor.images.setValue(images);
    console.log(this.fEditor.images.value);
  }

  removeShowcase(data: Showcase) {
    this._modalService.hide();

    this.isUploading = true;
    this._sharedService.deleteContent('product/delete/' + data._id).subscribe((res: IResponseData) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        this._toastr.success('Removed this member successfully');
        this.user.removeShowcase(data);
      } else {
        console.log(res.message);
        this._toastr.error('Something went wrong. Please try again');
      }
    }, error => {
      console.log(error);
      this.isUploading = false;
      this._toastr.error('Something went wrong. Please try again');
    });
  }

  onSubmitEditor() {
    console.log(this.fEditor.images.value);

    this.isEditorSubmitted = true;
    if(this.formEditor.invalid) {
      this._toastr.error('There are some items that require your attention.');
      return;
    }

    const data = new SaveShowcaseQuery({
      ... this.formEditor.value,
      userId: this.user._id,
    }).toJson();

    this.isUploading = true;
    const req = this.selectedShowcase ? 
      this._sharedService.put(data, `product/update/${this.selectedShowcase._id}`) : 
      this._sharedService.post(data, 'product/create');
    req.subscribe((res: ICreateShowcaseResult) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        if(this.selectedShowcase) {
          this.selectedShowcase.updateWith(res.data);
        }  else {
          this.user.setShowcase(res.data);
        }
        this._toastr.success( this.selectedShowcase ?'Updated successfully' : 'Created successfully');
        this._modalService.hide();
      } else {
        this._toastr.error('Something wrong. Please try again.');
      }
    }, error => {
      console.log(error);
      this.isUploading = false;
      this._toastr.error('Something wrong. Please try again.');
    });
  }
}
