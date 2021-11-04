import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatDateTimeDataToDate, formatDateToDateTimeData, formatDateToString, formatStringToDate, formatStringToDateTimeData } from 'src/app/_helpers/date-formatter';
// import { pattern } from 'src/app/_helpers/pattern';
import { expandVerticalAnimation, slideVerticalAnimation } from '../../_helpers/animations';

@Component({
  selector: 'form-item-datetime',
  templateUrl: './form-item-datetime.component.html',
  styleUrls: ['./form-item-datetime.component.scss'],
  animations: [slideVerticalAnimation, expandVerticalAnimation],
})
export class FormItemDatetimeComponent implements OnInit {

  @Input() controller: FormControl;
  @Input() minDateTime: DateTimeData;
  @Input() placeholder: string = 'yyyy-mm-dd HH:MM'
  @Input() dateOnly: boolean = false;

  @Input() stepMinute = 15;
  @Input() stepHour = 1;

  @Input() label: string;
  @Input() disabled: boolean = false;
  @Input() submitted: boolean = false;

  @Output() changeValue = new EventEmitter<Date>();

  get sizeS() { return !!(!window || window.innerWidth < 768); }

  public isPickerShown = false;

  public form: { date: Date, time: Date };

  public _minDateTime: Date

  @ViewChild('formBlur') private formBlur: ElementRef;

  constructor(
  ) { }

  ngOnInit(): void {
    const min = this.minDateTime;
    this._minDateTime = new Date(
      min && min.year ? min.year : 1900,
      min && min.month ? min.month - 1 : 0,
      min && min.day ? min.day : 1,
      min && min.hour ? min.hour : 0,
      min && min.minute ? min.minute : 0,
    );

    this.initDateTimePicker();
  }

  initDateTimePicker() {
    /** update using current controller value */
    const datetime = 
      this.controller.value && formatStringToDate(this.controller.value) ? formatStringToDate(this.controller.value) :
      this.minDateTime ? formatDateTimeDataToDate(this.minDateTime) :
      new Date();

    this.form = { 
      ...{ date: datetime }, 
      ...{ time: datetime },
    }
  }

  /** update controller value by selecting by datetime picker */
  updateDateTime(emit: boolean = false) {
    const date: Date = this.form.date;
    const time: Date = this.form.time;
    const datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());

    this.controller.setValue(formatDateToString(datetime, this.dateOnly));
    if (emit) {
      this.changeValue.emit(datetime);
    }
  }

  getFormattedValue() {
    const datetime = this.controller.value;
    return formatStringToDate(datetime);
  }

  showPicker() {
    if (!this.isPickerShown) {
      this.initDateTimePicker();
    }
    this.isPickerShown = true;
    if(this.sizeS && this.formBlur.nativeElement) {
      (this.formBlur.nativeElement as HTMLDivElement).focus();
    }
  }
  hidePicker() { this.isPickerShown = false; }

}

function copy(obj: { [k: string]: any }, key: string) {
  return JSON.parse(JSON.stringify(obj))[key];
}

interface DateData {
  year: number;
  month: number;
  day: number;
}

interface TimeData {
  hour: number;
  minute: number;
}

export interface DateTimeData extends DateData, TimeData {
}
