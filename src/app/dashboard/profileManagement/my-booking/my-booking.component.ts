import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DateTimeData, FormItemDatetimeComponent } from 'src/app/shared/form-item-datetime/form-item-datetime.component';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { formatDateToString } from 'src/app/_helpers/date-formatter';
import { SharedService } from '../../../shared/services/shared.service';
import { validators } from '../../../_helpers/form-settings';

@Component({
  selector: 'app-my-booking',
  templateUrl: './my-booking.component.html',
  styleUrls: ['./my-booking.component.scss']
})
export class MyBookingComponent implements OnInit {

  get selectedBooking() { return this._modalService.data; }

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
  public minDateTime: DateTimeData;
  public isBookingRescheduleLoading: boolean = false;
  public isBookingRatingLoading: boolean = false;

  @ViewChild(FormItemDatetimeComponent) formDateTimeComponent: FormItemDatetimeComponent;
  @ViewChild(ModalComponent) private modalBookingReschedule: ModalComponent;
  @ViewChild(ModalComponent) private modalBookingRating: ModalComponent;

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
    private formBuilder: FormBuilder,
    private _router: Router,
    private _uService: UniversalService,  
    private _modalService: ModalService,
  ) { }

  get f() { return this.bookingForm.controls; }
  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Manage booking | PromptHealth',
    });

    const now = new Date();
    this.minDateTime = {
      year: now.getFullYear(), 
      month: now.getMonth() + 1, 
      day: now.getDate(),
      hour: 9,
      minute: 0
    };

    this.bookingForm = this.formBuilder.group({
      bookingDateTime: new FormControl('', validators.bookingDateTime),
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

  rescheduleBooking(data: any) {
    this._modalService.show('booking-reschedule', data);
    const datetime = new Date(data.bookingDateTime);
    this.f.bookingDateTime.setValue(formatDateToString(datetime));
  }
  onSubmitBookingReschedule() {
    this.submitted = true;
    if (this.bookingForm.invalid) {
      this.toastr.error('There is an error that requires your attention.');
      return;
    }
    else {
      const formData = {
        ...this.bookingForm.value,
      }
      let data = {
        'id': this.selectedBooking._id,
        ...formData,
      };
      // data.timing = this.timingSelectedValue;
      data.bookingDateTime = this.formDateTimeComponent.getFormattedValue().toString();
      // data.bookingDateTime = data.bookingDateTime.toString();
 
      const path = `/booking/rescheduleBooking`
      this.isBookingRescheduleLoading = true;
      this._sharedService.put(data, path).subscribe((res: any) => {
        this.isBookingRescheduleLoading = false;
        this.modalBookingReschedule.hide();
  
        if (res.statusCode === 200) {
          this.toastr.success('Rescheduled booking. Please wait client\'s response');
          this.getBookingList();
        }

        else {
          this.toastr.error('Could not reschedule booking. Please try later');
          console.log(res.message);
        }
      }, (error) => {
        this.toastr.error('Could not reschedule booking. Please try later');
        this.isBookingRescheduleLoading = false;
        console.log(error);
      });
    }
  }

  ratingComponentClick(clickObj: any): void {
    this.ratingClicked = clickObj.rating
  }
  showReviewModal(booking) {
    this._modalService.show('booking-rating', booking)
  }
  submitRating() {
    this.ratingSubmited = true;
    const payload = {
      drId: this.selectedBooking.drId._id,
      bookingId: this.selectedBooking._id,
      userId: this.userId,
      rating: this.ratingClicked,
      review: this.review
    }
    const path = decodeURI('user/add-rating/');
    this.isBookingRatingLoading = true;
    this._sharedService.post(payload, path).subscribe((res: any) => {
      this.isBookingRatingLoading = false;
      
      if (res.statusCode === 200) {
        this.toastr.success(res.message);
        this.modalBookingRating.hide();

        this.getBookingList();
      } else {
        console.log(res.message);
        this.toastr.error(res.message);

      }
    }, err => {
      this.isBookingRatingLoading = false;
      this.toastr.error('Could not upload your review. Please try again');
      console.log(err);
    });
  }
}
