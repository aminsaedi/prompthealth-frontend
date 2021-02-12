import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-videos-blogs',
  templateUrl: './videos-blogs.component.html',
  styleUrls: ['./videos-blogs.component.scss']
})
export class VideosBlogsComponent implements OnInit {
  userId: '';
  videosForm: FormGroup;
  videosList;
  addMore = false;
  currentPage;
  totalItems;
  pageSize: 10;

  // reg = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;
  reg = /^http(s)?:\/\/(w{3}\.)?((youtube|vimeo)\.com|youtu.be)\/.+/;

  constructor(
    private _fb: FormBuilder,
    private sharedService: SharedService,
    private toastrService: ToastrService
  ) {
  }
  get formArr() {
    return this.videosForm.get('data') as FormArray;
  }
  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('user'))._id;
    this.videosForm = this._fb.group({
      data: this._fb.array([this.initItemRows()])
    });
    this.getProfileDetails();
  }
  get url(): FormArray {
    return this.videosForm.get('url') as FormArray;
  }
  getProfileDetails() {
    const path = `user/get-profile/${this.userId}`;
    this.sharedService.get(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.videosList = res.data[0].videos;
        this.totalItems = this.videosList.length;

      } else {
        this.sharedService.checkAccessToken(res.message);
      }
    }, err => {

      this.sharedService.checkAccessToken(err);
    });
  }
  initItemRows() {
    return this._fb.group({
      // list all your form controls here, which belongs to your form array
      title: ['', [Validators.required]],
      url: ['', [Validators.required, Validators.pattern(this.reg)]],
    });
  }
  addNewRow() {
    this.formArr.push(this.initItemRows());
  }

  deleteRow(index: number) {
    this.formArr.removeAt(index);
  }

  saveVideos() {
    const path = `user/addVideo`;
    const payload = { user_id: this.userId, data: this.videosForm.value.data };
    // payload.data[0].url = `https://www.youtube.com/embed/${this.getEmbededURL(payload.data[0].url)}`;
    // payload.data[0].url = `https://www.youtube.com/watch?v=${this.getEmbededURL(payload.data[0].url)}`;
    this.sharedService.loader('show');
    this.sharedService.post(payload, path).subscribe((res: any) => {
      this.sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.getProfileDetails();
        this.toastrService.success(res.message);
        this.addMore = false;
        this.videosForm = this._fb.group({
          data: this._fb.array([this.initItemRows()])
        });
        // this._router.navigate(['/home']);
      } else {
        this.toastrService.error(res.message);

      }
    }, err => {
      this.sharedService.loader('hide');
    });

  }
  getEmbededURL(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? match[2]
      : null;
  }
  deleteVideo(i) {
    this.sharedService.loader('show');
    const path = `user/removeVideo/${this.userId}/${i}`;
    this.sharedService.deleteContent(path).subscribe((res: any) => {
      this.sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.toastrService.success(res.message);
        this.videosList.forEach((ele, index) => {
          if (ele._id === i) { this.videosList.splice(index, 1); }
        });
        // this._router.navigate(['/home']);
      } else {
        this.toastrService.error(res.message);

      }
    }, err => {
      this.sharedService.loader('hide');
    });

  }
}

