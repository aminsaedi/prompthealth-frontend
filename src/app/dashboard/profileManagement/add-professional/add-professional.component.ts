import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-professional',
  templateUrl: './add-professional.component.html',
  styleUrls: ['./add-professional.component.scss']
})
export class AddProfessionalComponent implements OnInit {
  addDoctorForm: FormGroup;
  editDoctorForm: FormGroup;
  editDoctorCheck = false;
  submitted = false;
  addMore = false;
  doctors = [];
  editDoctorId = '';
  doctorSearch: '';
  imagesList = '';
  currentPage: 1;
  totalItems
  pageSize: 10
  userId: '';
  public AWS_S3='';
  constructor(
    private _sharedService: SharedService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('user'))._id;
    this.addDoctorForm = this.formBuilder.group({
      fname: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/\S+/)]],
      lname: ['', [Validators.maxLength(50), Validators.pattern(/\S+/)]],
      description: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/\S+/)]],
    });
    this.editDoctorForm = this.formBuilder.group({
      fname: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/\S+/)]],
      lname: ['', [Validators.maxLength(50), Validators.pattern(/\S+/)]],
      description: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/\S+/)]],
    });
    this.getStaffList();
    this.AWS_S3 = environment.config.AWS_S3
  }

  get f() { return this.addDoctorForm.controls; }
  get ef() { return this.editDoctorForm.controls; }
  getStaffList() {
    let path = `staff/get-all?userId=${this.userId}&count=10&page=1&frontend=0/`;
    this._sharedService.get(path).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.doctors = res.data.data;
        this.totalItems = this.doctors.length;
        if (this.doctors.length > 0) this.addMore = false

      } else {
        this._sharedService.checkAccessToken(res.message);
      }
    }, err => {

      this._sharedService.checkAccessToken(err);
    });
  }
  pageChanged(event) {
  }
  onFileSelect(event) {
    const formData: FormData = new FormData();
    let input = new FormData();
    input.append('imgLocation', 'users');
    input.append('images', event.target.files[0]);
    this._sharedService.loader('show');
    this._sharedService.imgUpload(input, 'common/imgUpload').subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.imagesList = res.data;
        this._sharedService.loader('hide');
      } else {
        this.toastr.error(res.message);
      }
    }, err => {
      this._sharedService.loader('hide');
      this.toastr.error('There are some errors, please try again after some time !', 'Error');
    });


  }
  save() {
    this.submitted = true;
    if (this.addDoctorForm.invalid) {
      return;
    }
    else {
      const formData = {
        ...this.addDoctorForm.value,
        'image': this.imagesList,
      }
      let data = {
        'userId': this.userId,
        ...formData,
      };
      data['userId'] = this.userId;
      this._sharedService.loader('show');
      const path = `staff/create`;
      this._sharedService.post(data, path).subscribe((res: any) => {
        this._sharedService.loader('hide');
        console.log(res);
        if (res.statusCode === 200) {
          this.imagesList = '';
          this.toastr.success(res.message);
          this.getStaffList();
          this.addMore = !this.addMore;
          this.addDoctorForm.reset();
          this.submitted = false;

        }

        else {
          this._sharedService.showAlert(res.message, 'alert-danger');
        }
      }, (error) => {
        this.toastr.error(error);
        this._sharedService.loader('hide');
      });
    }
  }
  deleteStaff(i) {
    this._sharedService.loader('show');
    const path = `staff/delete/${i}`;
    this._sharedService.deleteContent(path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.toastr.success(res.message);
        this.doctors.forEach((ele, index) => {
          if (ele._id === i) this.doctors.splice(index, 1);
        });
        // this._router.navigate(['/home']);
      } else {
        this.toastr.error(res.message);

      }
    }, err => {
      this._sharedService.loader('hide');
    });
  }
  editStaff(prod) {
    this.submitted = false;
    this.editDoctorCheck = true
    this.editDoctorForm.controls.fname.setValue(prod.fname);
    this.editDoctorForm.controls.lname.setValue(prod.lname);
    this.editDoctorForm.controls.description.setValue(prod.description);
    this.imagesList = prod.image;
    this.editDoctorId = prod._id;
  }
  updateStaff() {
    this.submitted = true;

    if (this.editDoctorForm.invalid) {
      return;
    }
    else {
      const formData = {
        ...this.editDoctorForm.value,
        'image': this.imagesList,
      }
      let body = {
        'userId': this.userId,
        ...formData,
      };
      body['userId'] = this.userId;
      const path = `staff/update/${this.editDoctorId}`
      this._sharedService.put(body, path).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {
          this.toastr.success(res.message);
          this.getStaffList();
          this.editDoctorCheck = !this.editDoctorCheck;
          this.addMore = !this.addMore;
          this.addDoctorForm.reset();
          this.submitted = false;

        }

        else {
          this._sharedService.showAlert(res.message, 'alert-danger');
        }
      }, (error) => {
        this.toastr.error(error);
        this._sharedService.loader('hide');
      });
    }
  }
}
