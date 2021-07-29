import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocialPost } from 'src/app/models/social-post';
import { SocialService } from '../social.service';
import { CalendarOptions, GoogleCalendar, ICalendar, OutlookCalendar, YahooCalendar} from 'datebook';
import { FormSubscribeComponent } from 'src/app/shared/form-subscribe/form-subscribe.component';
import { ToastrService } from 'ngx-toastr';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'modal-event',
  templateUrl: './modal-event.component.html',
  styleUrls: ['./modal-event.component.scss']
})
export class ModalEventComponent implements OnInit {

  get post() { return this._modalService.data as SocialPost; }

  public isCalendarMenuShown: boolean = false;
  public isSubscribeMenuShown: boolean = false;

  public isLoading: boolean = false;
  public isRedirecting: boolean = false;

  public timeRedirect: number = 5;
  public timerRedirect: any;

  @ViewChild('formSubscribe') formSubscribe: FormSubscribeComponent;
  @ViewChild('modalSubscribeMenu') modalSubscribeMenu: ModalComponent;
  @ViewChild('modalCalendarMenu') modalCalendarMenu: ModalComponent;

  constructor(
    private _toastr: ToastrService,
    private _modalService: ModalService,
  ) { }

  ngOnInit() {}

  addToCalendar(calendarType: string) {
    const calendarOption: CalendarOptions = {
      title: this.post.title,
      location: '',
      description: this.post.event.link,
      start: this.post.event.startAt,
      end: this.post.event.endAt,
    }

    let calendar: GoogleCalendar | ICalendar | OutlookCalendar | YahooCalendar;
    switch(calendarType) {
      case 'google': 
        calendar = new GoogleCalendar(calendarOption); 
        window.open(calendar.render(), '_blank');
        break;
      case 'ical': 
        calendar = new ICalendar(calendarOption); 
        calendar.download('calendar.ics')
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
    this._toastr.success('Thank you for subscribe! you are redireced to event page within 5 seconds');

    this.timeRedirect = 5;
    this.isRedirecting = true;

    this.timerRedirect = setInterval(() => {
      this.timeRedirect --;

      if (this.timeRedirect <= 0 && location) {
        this.isRedirecting = false;
        clearInterval(this.timerRedirect);
        location.href = this.post.event.link;
        this.modalSubscribeMenu.hide();
      }
    }, 1000);
  }

  onErrorSubscribe() {
    this.isLoading = false;
  }

}
