import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { IUserDetail } from 'src/app/models/user-detail';
import { PriceType } from 'src/app/theme/header/header.component';

@Injectable({
  providedIn: 'root'
})
export class HeaderStatusService {

  constructor() { }

   /** Header status and function for visibility */
   public observeHeaderStatus(): Observable<any>{ return this.headerStatusObserver; }
   private headerStatusObserver = new Subject<any>();
   private emitHeaderStatus(key: string, val: any, animate: boolean = false){
     this.headerStatusObserver.next([key,val, animate]); 
   }
 
   hideHeader(animate: boolean = false){ this.emitHeaderStatus('isHeaderShown', false, animate); }
   showHeader(animate: boolean = false){this.emitHeaderStatus('isHeaderShown', true, animate); }
   hideNavMenu(){
     this.emitHeaderStatus('isNavMenuShown', false)
     this.emitHeaderStatus('levelMenuSm', 0);
   }
   showNavMenu(jumpToCategory: boolean = true){
     this.emitHeaderStatus('isNavMenuShown', true)
     this.emitHeaderStatus('levelMenuSm', (jumpToCategory)? 1 : 0);
   }
   changeLevelMenuSm(i: number){ 
     this.emitHeaderStatus('levelMenuSm', i);
   }

   hideShadow() {
     this.emitHeaderStatus('isShadowShown', false);
   }
   showShadow() {
     this.emitHeaderStatus('isShadowShown', true);
   }
  
   setPriceType(type: PriceType) {
     this.emitHeaderStatus('priceType', type);
   }
}
