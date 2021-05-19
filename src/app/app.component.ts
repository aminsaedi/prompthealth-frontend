import { Component, OnInit } from '@angular/core';
import { ScrollTopService } from './scrolltop.service';
import { SharedService } from './shared/services/shared.service';
import { UniversalService } from './shared/services/universal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'wellness-frontend';
  constructor(
    private scrollTopService: ScrollTopService,
    private _uService: UniversalService,
    ) {
}

async ngOnInit() {
  this.scrollTopService.setScrollTop();
  if(!this._uService.isServer){
    try { await this.getPosition(); }
    catch(error){ console.log(error); }  
  }
}

getPosition(): Promise<any> {
  return new Promise((resolve, reject) => {

    navigator.geolocation.getCurrentPosition(resp => {
      resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });

      localStorage.setItem('ipLat', resp.coords.latitude.toString());
      localStorage.setItem('ipLong', resp.coords.longitude.toString());
    },
    err => {
      reject(err);
    }, {enableHighAccuracy: true, maximumAge:0, timeout: 1000000});
  });

}
}
