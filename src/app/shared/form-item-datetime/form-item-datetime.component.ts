import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { pattern } from 'src/app/_helpers/form-settings';
import {slideVerticalAnimation } from '../../_helpers/animations';

@Component({
  selector: 'form-item-datetime',
  templateUrl: './form-item-datetime.component.html',
  styleUrls: ['./form-item-datetime.component.scss'],
  animations: [slideVerticalAnimation]
})
export class FormItemDatetimeComponent implements OnInit {

  @Input() controller: FormControl
  @Input() minDateTime: DateTimeData;

  @Input() stepMinute: number = 15;
  @Input() stepHour: number = 1;

  @Input() disabled: boolean = false;

  public isPickerShown = false;

  @Output() changeValue = new EventEmitter<Date>();

  public fDate: FormControl;
  public fTime: FormControl;

  public dateTime: DateTimeData;
  constructor(
  ) { }

  ngOnInit(): void {
    
    if(this.controller.value) {
      const datetime = new Date(this.controller.value);
      this.dateTime = {
        year: datetime.getFullYear(),
        month: datetime.getMonth() + 1,
        day: datetime.getDate(),
        hour: datetime.getHours(),
        minute: datetime.getMinutes(),
      }
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hour = now.getHours();
      const minute = now.getMinutes();
  
      let isNowBeforeMinDateTime = true;
      if(this.minDateTime){
        if(year < this.minDateTime.year) {}
        else if(month < this.minDateTime.month) {}
        else if(day < this.minDateTime.day) {}
        else if(hour < this.minDateTime.hour) {}
        else if(minute < this.minDateTime.minute) {}
        else{
          isNowBeforeMinDateTime = false;
        }
      }
  
      this.dateTime = isNowBeforeMinDateTime ? 
      {
        year: copy(this.minDateTime, 'year'),
        month: copy(this.minDateTime, 'month'),
        day: copy(this.minDateTime, 'day'),
        hour: copy(this.minDateTime, 'hour'),
        minute: copy(this.minDateTime, 'minute'),
      } : 
      {
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: Math.floor((minute + 14) / 15) * 15,
      }
    }

    this.fDate = new FormControl(this.dateTime);
    this.fTime = new FormControl(this.dateTime);
    this.updateDateTime();
    
    this.fDate.valueChanges.subscribe(() => {
      this.updateDateTime(true);
    });
    this.fTime.valueChanges.subscribe(() => {
      this.updateDateTime(true);
    });
    // this.controller.valueChanges.subscribe(() => {
    //   console.log(this.controller.value);
    // })

  }

  /** update controller value by selecting by datetime picker */
  updateDateTime(emit: boolean = false){
    const date: DateData = this.fDate.value;
    const time: TimeData = this.fTime.value;

    this.controller.setValue(date.year + '-' + ('0' + date.month).slice(-2) + '-' + ('0' + date.day).slice(-2) + ' ' + ('0' + time.hour).slice(-2) + ':' + ('0' + time.minute).slice(-2));
    if(emit){
      this.changeValue.emit(this.getFormattedValue());
    }
  }

  getFormattedValue() {
    const date: DateData = this.fDate.value;
    const time: TimeData = this.fTime.value;

    const datetime = new Date(date.year + '-' + ('0' + date.month).slice(-2) + '-' + ('0' + date.day).slice(-2) + ' ' + ('0' + time.hour).slice(-2) + ':' + ('0' + time.minute).slice(-2));
    return datetime;
  }

  showPicker(){ 
    if(!this.isPickerShown) {
      const dt = this.controller.value;
      if(dt && dt.match(pattern.datetime)) {
        /** update using current controller value */
        const dtArray = dt.trim().split(' ');
        const dArray = dtArray[0].split('-');
        const tArray = dtArray[1].split(':');
        const date: DateData = {
          year: Number(dArray[0]),
          month: Number(dArray[1]),
          day: Number(dArray[2]),
        }
        const time: TimeData = {
          hour: Number(tArray[0]),
          minute: Number(tArray[1]),
        }

        this.fDate.setValue(date);
        this.fTime.setValue(time);

      }
    } 

    this.isPickerShown = true; 



  }
  hidePicker(){ this.isPickerShown = false; }
}

function copy(obj: {[k: string]: any}, key: string) {
  return JSON.parse(JSON.stringify(obj))[key];
}

interface DateData {
  year: number;
  month:  number;
  day:    number;
}

interface TimeData {
  hour:   number;
  minute: number;
}

export interface DateTimeData extends DateData, TimeData {
}