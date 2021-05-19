import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";

import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/shared/services/universal.service';
@Component({
  selector: 'app-my-amenities',
  templateUrl: './my-amenities.component.html',
  styleUrls: ['./my-amenities.component.scss']
})
export class MyAmenitiesComponent implements OnInit {
  addAmenitiesForm: FormGroup;
  userId = '';
  addMore = false;
  imagesList = [];
  defaultAmenities = []
  addAmenity = [];
  selectedAmenityId;
  uploadAmenity = {};

  updateAmenity = {};
  imagePushed = ''
  savedAminities = [];
  aminityObject
  submitted = false;
  currentPage;
  totalItems
  pageSize: 10
  public AWS_S3='';

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private _router: Router,
    private _uService: UniversalService,
  ) { }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Manage amenities | PromptHealth',
    });
    this.userId = JSON.parse(localStorage.getItem('user'))._id;
    this.getDefaultAmenities();
    this.getSavedAmenties();
    this.AWS_S3 = environment.config.AWS_S3
  }
  getDefaultAmenities() {

    let path = `amenity/get-default-aminities?frontend=0`;
    this.sharedService.get(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.defaultAmenities = res.data;

      } else {
        this.sharedService.checkAccessToken(res.message);
      }
    }, err => {

      this.sharedService.checkAccessToken(err);
    });

  }
  getSelectedAmenties(event, amenity) {
    if (event.target.checked) {
      this.selectedAmenityId = amenity._id;
      this.imagesList = [];
      // this.uploadAmenity = {
      //   userId: this.userId,
      //   defaultamenityId: amenity._id,
      //   images: [],
      // }

      // this.saveAmenities();
    } else {
      this.selectedAmenityId = null;
      // this.deleteAmenity(amenity._id);
    }
  }
  imageUpload(id) {
    this.imagePushed = id;
  }
  onFileSelect(event) {
    let target = null;
    this.savedAminities.forEach(a=>{
      if(a.defaultamenityId._id == this.selectedAmenityId){ target = a; }
    });

    const data = {images: []};
    if(target){
      data['id'] = target._id;
      data.images = target.images;
    }else{
      data['userId'] = this.userId;
      data['defaultamenityId'] = this.selectedAmenityId;
    }

    const formData: FormData = new FormData();
    let input = new FormData();
    input.append('imgLocation', 'amenities');
    this.spinner.show();
    if (event.target.files.length === 1) {

      input.append('images', event.target.files[0]);
      this.sharedService.imgUpload(input, 'common/imgUpload').subscribe((res: any) => {
        if (res.statusCode === 200) {
          // this.imagesList.push(res.data);
          this.uploadAmenity['images'] = [res.data];
          this.updateAmenity['images'] = [res.data];

          data.images.push(res.data);
          if(target){
            this.updateAmenity = data;
            this.updateAmenities();
          }else{
            this.uploadAmenity = data;
            this.saveAmenities();
          }
          this.imagesList = [];

          // this.updateAmenities();
          // this.saveAmenities();
          this.spinner.hide();
          // this.toastr.success(res.message);
        } else {
          this.toastr.error(res.message);
        }
      }, err => {
        this.sharedService.loader('hide');
        this.toastr.error('There are some errors, please try again after some time !', 'Error');
      });
    }
    else {
      // if (event.target.files.length > 3) event.target.files.pop();
      for (var i = 0; i < event.target.files.length; i++) {
        input.append('images', event.target.files[i]);
      }
      this.spinner.show();
      this.sharedService.imgUpload(input, 'common/imgMultipleUpload').subscribe((res: any) => {
        if (res.statusCode === 200) {
          // this.imagesList = res.data;
          // this.uploadAmenity['images'] = res.data;
          // this.updateAmenity['images'] = res.data;

          res.data.forEach(image=>{ data.images.push(image); })

          if(target){
            this.updateAmenity = data;
            this.updateAmenities();
          }else{
            this.uploadAmenity = data;
            this.saveAmenities();
          }
          this.imagesList = [];

          // this.updateAmenities();
          // this.saveAmenities();
          this.spinner.hide();
          // this.toastr.success(res.message);
        }
        else {
          this.toastr.error(res.message);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error('There are some errors, please try again after some time !', 'Error');
      });
    }
  }
  getSavedAmenties() {
    this.selectedAmenityId = null;
    const path = `amenity/get-all/?userId=${this.userId}&count=10&page=1&frontend=0`;
    this.sharedService.get(path).subscribe((res: any) => {
      this.spinner.show();
      if (res.statusCode === 200) {
        this.savedAminities = res.data.data;
        this.totalItems = this.savedAminities.length;
        this.addMore = false;
        this.spinner.hide();
        this.toastr.success(res.message);
      }

      else {
        this.toastr.error('There are some errors, please try again after some time !', 'Error');
        // this.sharedService.showAlert(res.message, 'alert-danger');
        this.spinner.hide();
      }
    }, (error) => {
      this.spinner.hide();
    });
  }

  saveAmenities() {
    this.spinner.show();
    const path = `amenity/create`;
    this.sharedService.post(this.uploadAmenity, path).subscribe((res: any) => {
      this.spinner.show();
      if (res.statusCode === 200) {
        this.getSavedAmenties();
        // this.updateAmenity = {
        //   id: res.data._id,
        // }
        // this.getSavedAmenties();
        this.spinner.hide();
      }

      else {
        // this.sharedService.showAlert(res.message, 'alert-danger');
        this.spinner.hide();
      }
    }, (error) => {
      this.spinner.hide();
    });
  }
  updateAmenities() {
    this.spinner.show();
    const path = `amenity/update`;
    const body = this.updateAmenity;
    this.sharedService.put(body, path).subscribe((res: any) => {
      this.spinner.show();
      if (res.statusCode === 200) {
        // this.toastr.success(res.message);
        this.spinner.hide();
        this.getSavedAmenties();
      }

      else {
        this.sharedService.showAlert(res.message, 'alert-danger');
        this.spinner.hide();
      }
    }, (error) => {
      this.spinner.hide();
    });
  }
  deleteAmenity(id) {

    this.spinner.show();
    const path = `amenity/delete/${id}`;
    this.sharedService.deleteContent(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success(res.message);
        this.savedAminities.forEach((ele, index) => {
          if (ele._id === id) this.savedAminities.splice(index, 1);
        });
        // this._router.navigate(['/home']);
        this.spinner.hide();
      } else {
        this.toastr.error(res.message);

      }
    }, err => {
      this.spinner.hide();
    });
  }
  editAmenity(amenity) {
  }
}
