import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeago'
})
export class TimeAgoPipe implements PipeTransform {

  transform(date: string | Date, ...args: unknown[]): unknown {

    const _date: Date = typeof date == 'string' ? new Date(date) : date;
    const now = new Date();

    const def = now.getTime() - _date.getTime();
    const y = Math.floor(def / (1000 * 60 * 60 * 24 * 365));
    if(y > 0) {
      return `${y} year${y > 1 ? 's' : ''} ago`;
    }

    const m = Math.floor(def / (1000 * 60 * 60 * 24 * 30));
    if(m > 0) {
      return `${m} month${m > 1 ? 's' : ''} ago`;
    }

    const w = Math.floor(def / (1000 * 60 * 60 * 24 * 7));
    if(w > 0) {
      return `${w} week${w > 1 ? 's' : ''} ago`;
    }

    const d = Math.floor(def / (1000 * 60 * 60 * 24));
    if(d > 0) {
      return `${d} day${d > 1 ? 's' : ''} ago`;
    }

    const h = Math.floor(def / (1000 * 60 * 60));
    if(h > 0) {
      return `${h} hour${h > 1 ? 's' : ''} ago`;
    }

    const min = Math.floor(def / (1000 * 60));
    if(min > 0) {
      return `${min} min${min > 1 ? 's' : ''} ago`;
    }

    return 'Now';
  }

}
