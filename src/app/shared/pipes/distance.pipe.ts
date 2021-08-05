import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distance'
})
export class DistancePipe implements PipeTransform {

  transform(km: number, ...args: unknown[]): string {
    if(km) {
      if (km < 1) {
        return Math.round(km * 1000) + 'm';
      } else if(km < 100) {
        return Math.round(km * 10) / 10 + 'km';
      } else {
        return Math.round(km) + 'km';
      }
    } else {
      return null;
    }
  }
}