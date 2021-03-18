import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../../environments/environment';
@Injectable()
export class BehaviorService {
    public city:BehaviorSubject<object> = new BehaviorSubject<object>({});
    public latLng:BehaviorSubject<object> = new BehaviorSubject<object>({});
    public loginRole: BehaviorSubject<object> = new BehaviorSubject<object>({});
    public cart:BehaviorSubject<object> = new BehaviorSubject<object>({});
    public user:BehaviorSubject<object> = new BehaviorSubject<object>({});
    public userData: BehaviorSubject<object> = new BehaviorSubject<object>({});

    rootUrl: string =   environment.config.BASE_URL;

    private compareIDs = new BehaviorSubject([]);
    currentCompareIDs = this.compareIDs.asObservable();

    constructor() {}

    changeCompareIds(compareIds) {
        this.compareIDs.next(compareIds)
    }

    getCopmareIds() {
        return this.compareIDs;
    }

    setCity( value ) {
        let city: object;
        let cityObject = { city: value };
        this.city.next( cityObject );
        return {};     
    }

    setLatLng( obj ) {
        let latLng: object;
        localStorage.setItem("latLng", JSON.stringify(obj));
        let latLngObject = { lat: obj.lat, lng: obj.lng };
        this.latLng.next( latLngObject );
        return {};     
    }

    setCart( value ) {
        let cart: object;
        let cartObject = { cart: value };
        this.cart.next( cartObject );
        return {};     
    }

    setUser( value ) {
        let user: object;
        let userObject = { user: value };
        this.user.next( userObject );
        return {};     
    }

    unsetCart( ) {
        this.cart.next({});
        return {};     
    }

    setUserData(data) {
        this.userData.next(data);
    }

    setUserVerifiedStatus(isVerified: boolean){
        this.setUserDataOf('verifiedBadge', isVerified);
    }
    setUserDataOf(key: string, value: any) {
        const user = JSON.parse(localStorage.getItem('user'));
        if(user){
            user[key] = value;
            localStorage.setItem('user', JSON.stringify(user));
            this.userData.next(user);
        }
    }
    
    getUserData() {
        return this.userData.asObservable();
    }

    unsetUser( ) {
        this.user.next({});
        return {};     
    }

    setRole(data) {
        this.loginRole.next(data);
    }

    getRole() {
        return this.loginRole.asObservable();
    }

}
