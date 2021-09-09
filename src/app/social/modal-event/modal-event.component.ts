import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, GoogleCalendar, ICalendar, OutlookCalendar, YahooCalendar} from 'datebook';
import { FormSubscribeComponent } from 'src/app/shared/form-subscribe/form-subscribe.component';
import { ToastrService } from 'ngx-toastr';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ISocialPost } from 'src/app/models/social-post';

@Component({
  selector: 'modal-event',
  templateUrl: './modal-event.component.html',
  styleUrls: ['./modal-event.component.scss']
})
export class ModalEventComponent implements OnInit {

  get post() { return this._modalService.data as ISocialPost; }

  public isCalendarMenuShown: boolean = false;
  public isSubscribeMenuShown: boolean = false;

  public isLoading: boolean = false;
  public isRedirecting: boolean = false;

  public timeRedirect: number = 5;
  public timerRedirect: any;

  public test: string;

  @ViewChild('formSubscribe') formSubscribe: FormSubscribeComponent;
  @ViewChild('modalSubscribeMenu') modalSubscribeMenu: ModalComponent;
  @ViewChild('modalCalendarMenu') modalCalendarMenu: ModalComponent;

  constructor(
    private _toastr: ToastrService,
    private _modalService: ModalService,
  ) { }

  ngOnInit() {
    const isICalAvailable = true;
    if(window && 'navigator' in window) {
      this.test =window.navigator.userAgent;
    }
  }

  addToCalendar(calendarType: string) {
    const calendarOption: CalendarOptions = {
      title: this.post.title,
      start: this.post.startAt,
      end: this.post.endAt,
      ...this.post.link && {description: this.post.link},
      ...!this.post.isVirtual && {location: this.post.venue},
    }

    let calendar: GoogleCalendar | ICalendar | OutlookCalendar | YahooCalendar;
    switch(calendarType) {
      case 'google': 
        calendar = new GoogleCalendar(calendarOption); 
        window.open(calendar.render(), '_blank');
        break;
      case 'ical': 
        calendar = new ICalendar(calendarOption); 
        // calendar.download('calendar.ics');
        window.open('webcal://' + calendar.render());


        break;
      case 'outlook':
        calendar = new OutlookCalendar(calendarOption);
        window.open(calendar.render(), '_blank');
        break;
      case 'yahoo':
        calendar = new YahooCalendar(calendarOption);
        window.open(calendar.render(), '_blank');
        break;
    }

    setTimeout(() => {
      this.modalCalendarMenu.hide();
    }, 200);
  }



  onSubmitSubscribe() {
    this.isLoading = true;
    this.formSubscribe.onSubmit(false);
  }
  onSuccessSubscribe() {
    this.isLoading = false;
    if(!this.post.link) {
      this._toastr.success('Thank you for subscribe!');
    } else {
      this._toastr.success('Thank you for subscribe! you are redireced to event page within 5 seconds');

      this.timeRedirect = 5;
      this.isRedirecting = true;
  
      this.timerRedirect = setInterval(() => {
        this.timeRedirect --;
  
        if (this.timeRedirect <= 0 && location) {
          this.isRedirecting = false;
          clearInterval(this.timerRedirect);
          location.href = this.post.link;
          this.modalSubscribeMenu.hide();
        }
      }, 1000);
    }
  }

  onErrorSubscribe() {
    this.isLoading = false;
  }

}
