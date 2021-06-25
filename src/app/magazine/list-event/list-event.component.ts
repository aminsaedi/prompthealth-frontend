import { Location } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Blog } from 'src/app/models/blog';

@Component({
  selector: 'list-event',
  templateUrl: './list-event.component.html',
  styleUrls: ['./list-event.component.scss']
})
export class ListEventComponent implements OnInit {

  get headliner() {
    let res = null;
    if(this.latest && this.latest.length > 0) {
      res = this.latest[0];
    }
    return res;
  }

  get isDatePickerActive() { return !!this.fromDate;  }

  @Input() latest: Blog[];
  @Input() archive: Blog[];

  public isDatePickerShown: boolean = false;
  public minDate: NgbDate;
  public fromDate: NgbDate = null;
  public toDate: NgbDate | null = null;
  public hoveredDate: NgbDate | null = null;
  public displayMonths = 1;

  @HostListener('window:resize') onWindowResize() {
    this.setDisplayMonths();
  }

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
  ) { }

  ngOnInit(): void {
    const now = new Date();
    this.minDate = new NgbDate( now.getFullYear(), now.getMonth() + 1, now.getDate() );
    this.setDisplayMonths();

    this._route.queryParams.subscribe((params: {modal: ModalType}) => {
      this.isDatePickerShown = !!(params.modal == 'date-picker');
    }); 
  }

  showModal(modal: ModalType) {
    if(!this.isDatePickerShown) {
      this._router.navigate(['./'], {relativeTo: this._route, queryParams: {modal: modal}});
    }
  }

  hideModal() {
    if(this.isDatePickerShown) {
      this._location.back();
    }
  }

  /** modalDatePicker START */
  setDisplayMonths() {
    this.displayMonths = (window && window.innerWidth >= 768) ? 2 : 1;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  resetDatePicker() {
    this.fromDate = null;
    this.toDate = null;
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }
  isDisabled(date: NgbDate) {
    return date.before(this.minDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }
  /** modalDatePicker END */
}


type ModalType = 'date-picker';

