import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { formatDateTimeDataToDate, formatDateToDateTimeData, formatStringToDateTimeData } from 'src/app/_helpers/date-formatter';
import { pattern } from 'src/app/_helpers/pattern';
import { slideVerticalAnimation } from '../../_helpers/animations';

@Component({
  selector: 'form-item-datetime',
  templateUrl: './form-item-datetime.component.html',
  styleUrls: ['./form-item-datetime.component.scss'],
  animations: [slideVerticalAnimation]
})
export class FormItemDatetimeComponent implements OnInit {

  @Input() controller: FormControl;
  @Input() minDateTime: DateTimeData;

  @Input() stepMinute = 15;
  @Input() stepHour = 1;

  @Input() disabled = false;

  public isPickerShown = false;

  @Output() changeValue = new EventEmitter<Date>();

  public fDate: FormControl;
  public fTime: FormControl;

  public dateTime: DateTimeData;
  constructor(
  ) { }

  ngOnInit(): void {
    const datetime = formatStringToDateTimeData(this.controller.value);
    if (datetime) {
      this.dateTime = datetime;
    } else if (this.minDateTime) {
      this.dateTime = this.minDateTime;
    } else {
      const now = new Date();
      this.dateTime = formatDateToDateTimeData(now);
    }

    this.fDate = new FormControl(this.dateTime);
    this.fTime = new FormControl(this.dateTime);

    this.fDate.valueChanges.subscribe(() => {
      this.updateDateTime(true);
    });
    this.fTime.valueChanges.subscribe(() => {
      this.updateDateTime(true);
    });

  }

  initDateTimePicker(dt: string) {
    /** update using current controller value */
    const datetime = formatStringToDateTimeData(dt);

    if (datetime) {
      this.fDate.setValue({
        ...datetime
      });
      this.fTime.setValue({
        ...datetime
      });
    } else {
      this.fDate.setValue({
        ... this.minDateTime
      });
      this.fTime.setValue({
        ...this.minDateTime
      });
    }

  }

  /** update controller value by selecting by datetime picker */
  updateDateTime(emit: boolean = false) {
    const date: DateData = this.fDate.value;
    const time: TimeData = this.fTime.value;

    this.controller.setValue(date.year + '-' + ('0' + date.month).slice(-2) + '-' + ('0' + date.day).slice(-2) + ' ' + ('0' + time.hour).slice(-2) + ':' + ('0' + time.minute).slice(-2));
    if (emit) {
      this.changeValue.emit(this.getFormattedValue());
    }
  }

  getFormattedValue() {
    const date: DateData = this.fDate.value;
    const time: TimeData = this.fTime.value;

    const datetime = new Date(date.year + '-' + ('0' + date.month).slice(-2) + '-' + ('0' + date.day).slice(-2) + ' ' + ('0' + time.hour).slice(-2) + ':' + ('0' + time.minute).slice(-2));
    return datetime;
  }

  showPicker() {
    if (!this.isPickerShown) {
      this.initDateTimePicker(this.controller.value);
    }
    this.isPickerShown = true;
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
