import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(seconds: number, ...args: unknown[]): unknown {
    let h: number = Math.floor( seconds / 3600 ) || 0;
    let m: number = Math.floor( (seconds - h * 3600) / 60 ) || 0;
    let s: number = Math.floor( seconds - h * 3600 - m * 60) || 0; 
        
    let duration = "";
    if(h > 0) {
      duration += `${('0' + h).slice(-2)}:`;
    }
    duration += `${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`
    
    return duration;
  }

}
