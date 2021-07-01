import { DateTimeData } from "../shared/form-item-datetime/form-item-datetime.component";
import { pattern } from "./form-settings";

export function formatDateTimeDataToString(data: DateTimeData) {
  return _dateFormatter(data.year, data.month, data.day, data.hour, data.minute);
}

export function formatDateToString(data: Date) {
  return _dateFormatter(data.getFullYear(), data.getMonth() + 1, data.getDate(), data.getHours(), data.getMinutes());
}

export function formatStringToDateTimeData(data: string): DateTimeData {
  const dts = _splitDateString(data);
  if(dts && dts.length == 5) {
    return {
      year: dts[0],
      month: dts[1],
      day: dts[2],
      hour: dts[3],
      minute: dts[4],
    }
  } else {
    return null;
  }  
}

export function formatStringToDate(data: string): Date {
  const dts = _splitDateString(data);
  if(dts && dts.length == 5) {
    return new Date(dts[0], dts[1] - 1, dts[2], dts[3], dts[4]);
  } else {
    null;
  }
}

function _dateFormatter(y: number, m: number, d: number, H: number, M: number) {
  return `${y}-${('0' + m).slice(-2)}-${('0' + d).slice(-2)} ${('0' + H).slice(-2)}:${('0' + M).slice(-2)}`;
}

function _splitDateString(data: string): number[] {
  if(data && data.trim().match(pattern.datetime)) {
    const dtArray = data.trim().split(' ');
    const ds = dtArray[0].split('-');
    const ts = dtArray[1].split(':');
    return [ Number(ds[0]), Number(ds[1]), Number(ds[2]), Number(ts[0]), Number(ts[1]) ];
  } else{
    return null;
  }
}