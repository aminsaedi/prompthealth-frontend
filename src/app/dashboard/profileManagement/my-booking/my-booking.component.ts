import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-my-booking',
  templateUrl: './my-booking.component.html',
  styleUrls: ['./my-booking.component.scss']
})
export class MyBookingComponent implements OnInit {
  @ViewChild('closebutton') closebutton;
  @ViewChild('closeRatingbutton') closeRatingbutton;
  @ViewChild('reviewModal') reviewModal: ElementRef;
  bookingForm: FormGroup;
  ratingSubmited = false;
  ratingPayload = {}
  ratingClicked: number;
  review = '';
  public currentPage = 1;
  public totalItems: number;
  public itemsPerPage = 10;

  timingList = [
    { id: 'timing1', name: 'Morning' },
    { id: 'timing2', name: 'Afternoon' },
    { id: 'timing3', name: 'Evening' },
    { id: 'timing4', name: 'Anytime' },
  ];

  timingSelectedValue = '';
  startDate = new Date();
  minDate = new Date();
  bookingList = [];
  userId = '';
  roles = '';
  submitted = false;
  slectedBookingId = ''
  constructor(
    private _sharedService: SharedService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,) { }

  get f() { return this.bookingForm.controls; }
  ngOnInit(): void {

    this.bookingForm = this.formBuilder.group({
      timing: new FormControl('', [Validators.required]),
      bookingDateTime: new FormControl('', [Validators.required]),
    });
    this.getBookingList();
  }

  getBookingList() {
    this.roles = localStorage.getItem('roles');
    // this.roles = 'U';
    this.userId = localStorage.getItem('loginID');

    const userType = (this.roles.toLowerCase() == 'u') ? 'client' : 'doctor';
    const path = `booking/get-by-${userType}/${this.userId}?count=${this.itemsPerPage}&page=${this.currentPage}`; 

    this._sharedService.loader('show');
    this._sharedService.get(path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.bookingList = res.data.data;
        this.totalItems = res.data.total;
      } else {
        this._sharedService.checkAccessToken(res.message);
      }
      }, err => {
        this._sharedService.loader('hide');
        this._sharedService.checkAccessToken(err);
      }
    );
  }
  cancelBooking(id) {
    this._sharedService.loader('show');
    const path = `booking/cancelBooking/`;
    let data = { "id": id }
    this._sharedService.put(data, path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.toastr.success(res.message);
        this.bookingList.forEach((ele, index) => {
          if (ele._id === id) this.bookingList.splice(index, 1);
        });
        // this._router.navigate(['/home']);
      } else {
        this.toastr.error(res.message);

      }
    }, err => {
      this._sharedService.loader('hide');
    });
  }
  updateBooking(id, status) {
    this._sharedService.loader('show');
    const path = `booking/updateBooking/`;
    let data = { id, status }
    this._sharedService.put(data, path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.toastr.success(res.message);
        this.bookingList.forEach((ele, index) => {
          if (ele._id === id) this.bookingList.splice(index, 1);
        });

        this.getBookingList();
      } else {
        this.toastr.error(res.message);

      }
    }, err => {
      this._sharedService.loader('hide');
    });
  }

  changePage(e: any){
    this.currentPage = e;
    this.getBookingList();
  }

  timingSelected(evt) {
    this.timingSelectedValue = evt.target.value;
  }

  rescheduleBooking(id) {
    this.slectedBookingId = id;
  }
  rescheduleBookingApi() {
    this.submitted = true;
    this.submitted = true;
    if (this.bookingForm.invalid) {
      return;
    }
    else {
      const formData = {
        ...this.bookingForm.value,
      }
      let data = {
        'id': this.slectedBookingId,
        ...formData,
      };
      data.timing = this.timingSelectedValue;
      data.bookingDateTime = data.bookingDateTime.toString();
      this._sharedService.loader('show');
      const path = `/booking/rescheduleBooking`
      this._sharedService.put(data, path).subscribe((res: any) => {
        this._sharedService.loader('hide');
        if (res.statusCode === 200) {
          this.toastr.success(res.message);

          this.getBookingList();
          this.closebutton.nativeElement.click();
        }

        else {
          this._sharedService.showAlert(res.message, 'alert-danger');
        }
      }, (error) => {
        this._sharedService.loader('hide');
      });
    }
  }

  ratingComponentClick(clickObj: any): void {
    this.ratingClicked = clickObj.rating
  }
  showReviewModal(bookid) {
    this.ratingPayload['drId'] = bookid.drId._id;
    this.ratingPayload['bookingId'] = bookid._id;
  }
  submitRating() {
    this.ratingSubmited = true;
    const payload = {
      ...this.ratingPayload,
      userId: this.userId,
      rating: this.ratingClicked,
      review: this.review
    }
    this._sharedService.loader('show');
    const path = decodeURI('user/add-rating/');
    this._sharedService.post(payload, path).subscribe((res: any) => {
      this._sharedService.loader('hide');
      if (res.statusCode === 200) {
        this.toastr.success(res.message);

        this.getBookingList();

        this.closeRatingbutton.nativeElement.click();
      } else {
        this.toastr.error(res.message);

      }
    }, err => {
      this._sharedService.loader('hide');
    });
  }
}
