import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Blog } from 'src/app/models/blog';
import { expandVerticalAnimation, slideVerticalAnimation } from 'src/app/_helpers/animations';
import { CalendarOptions, GoogleCalendar, ICalendar, OutlookCalendar, YahooCalendar} from 'datebook';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSubscribeComponent } from 'src/app/shared/form-subscribe/form-subscribe.component';
import { ToastrService } from 'ngx-toastr';
import { UniversalService } from 'src/app/shared/services/universal.service';

@Component({
  selector: 'detail-post',
  templateUrl: './detail-post.component.html',
  styleUrls: ['./detail-post.component.scss'],
})
export class DetailPostComponent implements OnInit {

  @Input() data: Blog;
  @Input() shorten: boolean = false;

  public isCalendarMenuShown: boolean = false;
  public isSubscribeMenuShown: boolean = false;
  public isLoading: boolean = false;
  public isRedirecting: boolean = false;

  public timeRedirect: number = 5;
  public timerRedirect: any;

  public alreadySubscribed: boolean = false;

  @ViewChild('formSubscribe') formSubscribe: FormSubscribeComponent

  constructor(
    private _location: Location,
    private _route: ActivatedRoute,
    private _router: Router,
    private _toastr: ToastrService,
    private _uService: UniversalService,
  ) { }

  get urlCurrent() {
    let url: string = null;
    if(this.data) { 
      url = location.href ? location.href : 'https://prompthealth.ca/magazines/' + this.data.slug;
    }
    return url;
  }


  ngOnInit(): void {
    this.alreadySubscribed = this._uService.localStorage.getItem('subscribed') === 'true' ? true : false;

    const url = location.href ? location.href : 'https://prompthealth.ca/magazines/' + this.data.slug;

    this._route.queryParams.subscribe((params: {modal: string}) => {
      if(!this.data && (params.modal == 'calendar-menu' || params.modal == 'subscribe-menu')) {
        this._router.navigate(['./'], {relativeTo: this._route, replaceUrl: true});
      }

      this.isCalendarMenuShown = (this.data && params.modal == 'calendar-menu');
      this.isSubscribeMenuShown = (this.data && params.modal == 'subscribe-menu');
    });
  }

  toggleCalendarMenu() {
    if(this.isCalendarMenuShown) {
      this.hideCalendarMenu();
    } else {
      this.showCalendarMenu();
    }
  }

  showCalendarMenu() {
    if(!this.isCalendarMenuShown) {
      this._router.navigate(['./'], {relativeTo: this._route, queryParams: {modal: 'calendar-menu'}});
    }
  }
  hideCalendarMenu() {
    if(this.isCalendarMenuShown) {
      this._location.back();
    }
  }

  toggleSubscribeMenu() {
    if (this.isSubscribeMenuShown) {
      this.hideSubscribeMenu();
    } else {
      this.showSubscribeMenu();
    }
  }

  showSubscribeMenu() {
    this._router.navigate(['./'], {relativeTo: this._route, queryParams: {modal: 'subscribe-menu'}});
  }
  hideSubscribeMenu() {
    if(this.isSubscribeMenuShown) {
      this._location.back();
    }
  }

  addToCalendar(calendarType: string) {
    const calendarOption: CalendarOptions = {
      title: this.data.title,
      location: '',
      description: this.data.event.link,
      start: this.data.event.startAt,
      end: this.data.event.endAt,
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
      this.hideCalendarMenu();
    }, 200);
  }

  onSubmitSubscribe() {
    this.isLoading = true;
    this.formSubscribe.onSubmit(false);
  }
  onSuccessSubscribe() {
    this.isLoading = false;
    this.alreadySubscribed = true;
    this._toastr.success('Thank you for subscribe! you are redireced to event page within 5 seconds');

    this.timeRedirect = 5;
    this.isRedirecting = true;

    this.timerRedirect = setInterval(() => {
      this.timeRedirect --;

      if (this.timeRedirect <= 0 && location) {
        this.isRedirecting = false;
        clearInterval(this.timerRedirect);
        location.href = this.data.event.link;        
        // const a = document.createElement('a');
        // a.href = this.data.event.link;
        // a.target = "_blank";
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
      }
    }, 1000);
  }

  onErrorSubscribe() {
    this.isLoading = false;
  }

}
