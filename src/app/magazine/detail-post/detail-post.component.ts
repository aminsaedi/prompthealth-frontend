import { Component, Input, OnInit } from '@angular/core';
import { Blog } from 'src/app/models/blog';
import { expandVerticalAnimation } from 'src/app/_helpers/animations';
import { CalendarOptions, GoogleCalendar, ICalendar, OutlookCalendar, YahooCalendar} from 'datebook';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'detail-post',
  templateUrl: './detail-post.component.html',
  styleUrls: ['./detail-post.component.scss'],
  animations: [expandVerticalAnimation],
})
export class DetailPostComponent implements OnInit {

  @Input() data: Blog;
  @Input() shorten: boolean = false;

  public isCalendarMenuShown: boolean = false;

  constructor(
    private _location: Location,
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this._route.queryParams.subscribe((params: {modal: string}) => {
      if(!this.data && params.modal == 'calendar-menu') {
        this._router.navigate(['./'], {relativeTo: this._route, replaceUrl: true});
      }

      this.isCalendarMenuShown = (this.data && params.modal == 'calendar-menu');
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

  addToCalendar(calendarType: string) {
    const calendarOption: CalendarOptions = {
      title: this.data.title,
      location: '',
      description: 'https://prompthealth.ca/magazines/' + this.data.slug,
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

}
