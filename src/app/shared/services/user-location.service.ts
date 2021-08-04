import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UniversalService } from './universal.service';

@Injectable({
  providedIn: 'root'
})
export class GeoLocationService {

  get location() { return this._location; }

  locationChanged(): Observable<GeoLocationType> {
    return this._locationChanged.asObservable();
  }

  constructor(
    private _uService: UniversalService,
  ) { }

  private _location: GeoLocationType;
  private _locationChanged = new Subject<GeoLocationType>();
  
  getCurrentLocation(): Promise<GeoLocationType> {
    return new Promise((resolve, reject) => {
      if (this._location) {
        resolve(this._location);
      } else {
        this.updateCurrentLocation().then((location) => {
          resolve(location);
        }, error => {
          reject(location);
        });
      }
    });
  }

  updateCurrentLocation(): Promise<GeoLocationType> {
    return new Promise((resolve, reject) => {
      if (!navigator || !navigator.geolocation) {
        const latlng = {lat: null, lng: null};
        this._locationChanged.next(latlng);
        reject(latlng)
      } else {
        navigator.geolocation.getCurrentPosition(res => {
          const latlng: GeoLocationType = {lat: res.coords.latitude, lng: res.coords.longitude};
          this._locationChanged.next(latlng);
          resolve(latlng);
        }, error => {
          console.log(error);
          const latlng = {lat: null, lng: null};
          this._locationChanged.next(latlng);
          reject(latlng);
        }, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        });
      }
    })
  }
}

export type GeoLocationType = {
  lat: number,
  lng: number,
};