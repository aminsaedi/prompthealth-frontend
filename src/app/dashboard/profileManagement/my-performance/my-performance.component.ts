import { Component, OnInit } from '@angular/core';
import { ProfileManagementService } from '../profile-management.service';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-my-performance',
  templateUrl: './my-performance.component.html',
  styleUrls: ['./my-performance.component.scss']
})
export class MyPerformanceComponent implements OnInit {

  public user: any;
  public countBooking: {
    approved: number;
    canceled: number;
    rejected: number;
    completed: number;
    pending:  number;
    rescheduled: number;
  } = null;

  constructor(
    private _profileService: ProfileManagementService,
    private _sharedService: SharedService,
  ) { }

  async ngOnInit(): Promise<void> {
    const user = JSON.parse(localStorage.getItem('user'));

    this.getBookingList(user._id)
    this.user = await this._profileService.getProfileDetail(user);
  }

  getBookingList(userId: string){
    const path = `booking/get-by-doctor/${userId}?count=0&page=1`;
    this._sharedService.get(path).subscribe((res: any) => {
      console.log(res);
      if (res.statusCode === 200 && res.data.data.length > 0) {
        const bookings: BookingData[] = res.data.data;
        const count = {approved: 0, canceled: 0, rejected: 0, completed: 0, pending: 0, rescheduled: 0,};
        bookings.forEach(b => {
          switch(b.status){
            case 0: count.pending ++; break;
            case 1: count.approved ++; break;
            case 2: count.rejected; break;
            case 3: count.canceled; break;
            case 4: count.completed ++; break;
            case 5: count.rescheduled ++; break;
            case 6: count.approved ++; break;
          }
        });
        this.countBooking = count;
      } else {
        // this._sharedService.checkAccessToken(res.message);
      }
    }, err => {
      console.log(err);
      // this._sharedService.checkAccessToken(err);
    });

  }
}

interface BookingData {
  bookingDateTime: Date,
  status: 
    0 /** pending */ | 
    1 /** approved */ | 
    2 /** rejected */ | 
    3 /** canceled */ | 
    4 /** completed */ | 
    5 /** rescheduled */ | 
    6 /** accepted */;
}
