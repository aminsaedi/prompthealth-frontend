import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { Booking } from 'src/app/models/booking';
import { GetQuery } from 'src/app/models/get-query';
import { IGetBookingsResult, IUpdateBookingResult } from 'src/app/models/response-data';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {

  get user() { return this._profileService.profile; }
  get userId() { return this.user?._id; }     //it always has value
  get userRole() { return this.user?.role; }  //it always has value

  get eligibleToShowBookings() {
    return this.viewType == 'client' || this.user.eligibleToManageBookings;
  }

  get selectedBooking() { return this._modalService.data; }
  get iconSortBy() {
    let icon: string;
    switch(this.order) {
      case 'asc': icon = 'sort-number'; break;
      case 'desc': icon = 'sort-number-reverse'; break;
      default: icon = 'line-height-2';
    }
    return icon;
  }
  get labelSortBy() {
    let label: string;
    switch(this.order) {
      case 'asc': label = 'Oldest'; break;
      case 'desc': label = 'Latest'; break;
      default: label = 'Sort by';
    }
    return label;
  }

  public bookings: Booking[] = null;
  public bookingsAll: Booking[] = null;
  public totalBookingCount: number;
  public order: 'asc' | 'desc';
  public viewType: 'client' | 'provider';

  public searchForm = new FormControl();
  public currentSearch: string = null;

  public isMoreBookings: boolean = true;
  public isLoading: boolean = false;
  public isPopupSortShown: boolean = false;
  public isDetailDeleteMode: boolean = false;
  public isDeleting: boolean = false;

  private countPerPage: number = 20;

  constructor(
    private _uService: UniversalService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _profileService: ProfileManagementService,
    private _toastr: ToastrService,
    private _sharedService: SharedService,
    private _modalService: ModalService,
  ) { }

  ngOnInit(): void {

    this._route.data.subscribe((data: {type: 'provider' | 'client' }) => {
      this.viewType = data.type;
    });

    if(this.eligibleToShowBookings) {
      this.fetchBookings();
    }

    this._uService.setMeta(this._router.url, {
      title: `My profile - Bookings${this.viewType == 'provider' ? ' with clients' : ''} | PromptHealth`,
    });
  }

  fetchBookings() {
    const query = new GetQuery({
      count: this.countPerPage,
      page: (this.bookingsAll ? Math.ceil(this.bookingsAll.length / this.countPerPage) : 0) + 1,
      ... (this.order) && { order: this.order },
      ... (this.currentSearch) && {search: this.currentSearch} 
    });
    
    
    const path = (this.viewType == 'provider' ? 'booking/get-by-doctor/' : 'booking/get-by-client/') + this.userId + query.toQueryParamsString();

    this.isLoading = true;
    this._sharedService.get(path).subscribe((res: IGetBookingsResult) => {
      this.isLoading = false;

      if(res.statusCode == 200) {

        if(!this.bookingsAll) {
          this.bookingsAll = [];
        }

        res.data.data.forEach(d => {
          this.bookingsAll.push(new Booking(d));
        });

        this.bookings = this.bookingsAll;

        this.totalBookingCount = res.data.total;
        this.isMoreBookings = this.bookingsAll.length < res.data.total;

      } else {
        console.log(res.message);
        this._toastr.error('Could not get bookings. Please try again');
      }
    }, (error) => {
      console.log(error);
      this.isLoading = false;
      this._toastr.error('Could not get bookings. Please try again');
    });
  }

  togglePopupSort() {
    this.isPopupSortShown = !this.isPopupSortShown;
  }
  hidePopupSort() {
    this.isPopupSortShown = false;
  }

  changeSortBy(order: 'asc' | 'desc') {
    if(this.order != order) {
      this.order = order;
      this.bookingsAll = null;
      this.fetchBookings();
    }
    this.hidePopupSort();
  }

  onclickDetail(data: Booking, markAsRead: boolean = false) {
    this.isDetailDeleteMode = false;
    this._modalService.show('booking-detail', data);

    if(markAsRead && !data.isRead) {
      this.markAsRead(data);
    }
  }

  toggleDetailDeleteMode(isDeleteMode: boolean = true) {
    this.isDetailDeleteMode = isDeleteMode
  }

  markAsRead(data: Booking) {
    if(data.provider._id == this.userId) {
      data.markAsRead();
      this._sharedService.get('booking/read/' + data._id).subscribe((res: IUpdateBookingResult) => {
        if(res.statusCode == 200) {
        } else {
          console.log(res.message);
          data.markAsUnread();
        }
      }, error => {
        console.log(error);
        data.markAsUnread();
      })
    }
  }

  delete(data: Booking) {
    if(data.client._id == this.userId) {
      this.isDeleting = true;
      this._sharedService.deleteContent('booking/' + data._id).subscribe(() => {
        this.isDetailDeleteMode = false;
        this._toastr.success('The booking has been cancelled.');
        this._modalService.hide();
        this.bookingsAll = this.bookingsAll.filter(item => item._id != data._id);
        this.bookings = this.bookings.filter(item => item._id != data._id);
        this.totalBookingCount --;
      }, error => {
        console.log(error);
        this._toastr.error('Something went wrong. Please try again');
      }, () => {
        this.isDeleting = false;
      });
    } else {
      this._toastr.error('You cannot cancel the booking');
    }
  }

  private timerSearch: any;
  onChangeSearch(keyword: string) {
    if(this.timerSearch) {
      clearTimeout(this.timerSearch);
    }

    keyword = keyword.toLowerCase();

    if(keyword?.length > 1) {
      const regex = new RegExp(keyword);
      this.bookings = this.bookingsAll ?  this.bookingsAll.filter(item => {
        let matched: boolean = this.viewType == 'provider' ? !!(
          item.patientName?.toLowerCase().match(regex) || 
          item.patientEmail?.toLowerCase().match(regex) || 
          item.patientNote?.toLowerCase().match(regex) || 
          item.patientPhone?.toLowerCase().match(regex)
        ) : !!(
          item.provider.firstName?.toLowerCase().match(regex) ||
          item.provider.lastName?.toLowerCase().match(regex) ||
          item.patientNote?.toLowerCase().match(regex) 
        );
        return matched;
      }) : [];

      this.timerSearch = setTimeout(() => {
        this.bookingsAll = null;
        this.currentSearch = keyword;
        this.fetchBookings();
      }, 600);

    } else {
      this.bookings = this.bookingsAll;
  
      if(this.currentSearch) {
        this.timerSearch = setTimeout(() => {
          this.bookingsAll = null;
          this.currentSearch = null;
          this.fetchBookings();
        }, 600);  
      }

    }

  }

}
