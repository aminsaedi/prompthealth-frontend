import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmbedVideoService } from 'ngx-embed-video';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { IResponseData, ISaveProfileResult } from 'src/app/models/response-data';
import { IVideo } from 'src/app/models/user-detail';
import { ModalStateType } from 'src/app/shared/modal/modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { validators } from 'src/app/_helpers/form-settings';
import { pattern } from 'src/app/_helpers/pattern';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-manager',
  templateUrl: './video-manager.component.html',
  styleUrls: ['./video-manager.component.scss']
})
export class VideoManagerComponent implements OnInit {

  get selectedVideo(): IVideo { return this._modalService.data; }
  get user() { return this._profileService.profile; }

  get fEditor() { return this.formEditor.controls; }

  public videos = [];
  public selectedVideoIframe: HTMLIFrameElement = null;

  public formEditor: FormGroup;
  public isEditorSubmitted: boolean = false;
  public isUploading: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private _modalService: ModalService,
    private _profileService: ProfileManagementService,
    private _embedService: EmbedVideoService,
    private _sharedService: SharedService,
    private _toastr: ToastrService,
    private _uService: UniversalService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    if(this.user.eligibleToManageVideo) {
      this.initIframesForVideo();
    }

    this._uService.setMeta(this._router.url, {
      title: 'My profile - Videos | PromptHealth'
    });
  }

  initIframesForVideo() {
    this.videos = [];
    this.user.videos.forEach(v => {
      const iframe: HTMLIFrameElement = this._embedService.embed(v.url);
      if(iframe) {
        this.videos.push(iframe);  
      }
    });
  }

  showEditor(data: IVideo = null) {
    this._modalService.show('video-editor', data);
  }

  showMenu(data: IVideo = null) {
    this._modalService.show('video-menu', data);
  }

  onModalEditorStateChanged(state: ModalStateType) {
    this.isEditorSubmitted = false;
    this.selectedVideoIframe = null;
    if(state == 'open') {
      this.initEditor(this.selectedVideo);
    } else {
      this.formEditor = null;
    }
  }

  onModalMenuStateChanged(state: ModalStateType) {
    this.selectedVideoIframe = state == 'open' ? this._embedService.embed(this.selectedVideo.url) : null;
  }

  initEditor(video: IVideo) {
    this.formEditor = new FormGroup({
      url: new FormControl(video ? video.url : null, validators.videoLink),
    });

    if(this.fEditor.url.value?.match(pattern.urlVideo)) {
      this.selectedVideoIframe = this._embedService.embed(this.fEditor.url.value);
    }
    this.fEditor.url.valueChanges.subscribe(val => {
      if(val?.match(pattern.urlVideo)) {
        this.selectedVideoIframe = this._embedService.embed(val);
      } else {
        this.selectedVideoIframe = null;
      }
    });
  }

  removeVideo(video: IVideo) {    
    this.isUploading = true;
    this._sharedService.deleteContent(`user/removeVideo/${this.user._id}/${video._id}`).subscribe((res: IResponseData) => {
      this.isUploading = false;
      if (res.statusCode === 200) {
        this._toastr.success('Removed successfully');
        const videos = this.user.videos.filter(item => item._id != video._id);
        this.user.update({videos: videos});
        this.initIframesForVideo();
        this._modalService.hide();
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

  onSubmitEditor(){
    this.isEditorSubmitted = true;
    if(this.formEditor.invalid) {
      this._toastr.error('There is an item that requires your attention');
      return;
    }

    if(!this.selectedVideoIframe) {
      this._toastr.error('Cannot add this video. This link might be broken. Please check again.');
      return;
    }

    this.isUploading = true;
    const path = this.selectedVideo ? ('user/updateVideo/' + this.selectedVideo._id) : 'user/addVideoSingle';
    this._sharedService.post(this.formEditor.value, path).subscribe((res: ISaveProfileResult) => {
      this.isUploading = false;
      if(res.statusCode == 200) {
        this.user.update({videos: res.data.videos});
        this.initIframesForVideo();
        this._toastr.success('Video added successfully');
        this._modalService.hide();
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
}
