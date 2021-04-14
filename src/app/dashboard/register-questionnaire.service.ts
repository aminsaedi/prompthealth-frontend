import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IUserDetail } from '../models/user-detail';

@Injectable({
  providedIn: 'root'
})
export class RegisterQuestionnaireService {

  get isCompleted() {
    let isCompleted = true;
    if(this.questionnaireData){
      this.questionnaireData.forEach(data => {
        if(!data.isComplete){ 
          isCompleted = false; 
        }
      });
    }else{
      isCompleted = false;
    }
    return isCompleted;
  }
  constructor(
    private _router: Router,
  ) { }

  private user: IUserDetail = {};
  private userTracking: IUserDetail = {}; /** this is used for tracking user data in personal match */

  private questionnaireData: QuestionnaireItemData[];
  
  /** notification for parent component to let it know current questionnaire index. */
  public  observeIndex(): Observable<number> { return this.indexObserver; }
  private indexObserver = new Subject<number>();
  private emitIndex(){ this.indexObserver.next(this.currentIndex); }
  private currentIndex: number;

  /** notification for child component to let it know navigation button is clicked in parent component */
  public  observeNavigation(): Observable<string> { return this.navigationObserver; }
  private navigationObserver = new Subject<string>();
  private emitNavigation(type: string){ this.navigationObserver.next(type); }

  /** notification for parent component to let it know user finished all questionnaire */
  public observeFinish(): Observable<boolean> { return this.finishOvserver; }
  private finishOvserver = new Subject<boolean>();
  private emitFinish(isCompleteAll: boolean){ this.finishOvserver.next(isCompleteAll); }


  init(data: QuestionnaireItemData[], user: IUserDetail){
    this.questionnaireData = data;
    this.user = user;
  }

  getUser(){ return this.user; }
  getUserTracking(){ return this.userTracking; }
  getPreviousNoAnsweredRoute(currentIndex: number){
    let route: string = null;
    this.questionnaireData.forEach((d,i)=>{
      if(!d.isComplete && i < currentIndex){
        route = d.route;
      }
    });
    return route;
  }

  getPreviousRoute(){
    const index = (this.currentIndex <= 0)? -1 : this.currentIndex - 1;
    if(index == -1){ return null; }
    else{ return this.questionnaireData[index].route;}
  }

  getNextRoute(){
    const index = (this.currentIndex >= this.questionnaireData.length - 1) ? -1 : this.currentIndex + 1;
    if(index == -1){ return null; }
    else{ return this.questionnaireData[index].route;}
  }

  setCurrentIndex(i: number){
    this.currentIndex = i;
    this.emitIndex();
  }

  /** send notification to child component (need to send notification to child to get relativeRoute)*/
  navigateByParent(type: string){ this.emitNavigation(type); }

  /** if previous questionnaire is not answered, go back to the questionnaire. if ok, set currentIndex */
  canActivate(currentRoute: ActivatedRoute, index: number){
    const route = this.getPreviousNoAnsweredRoute(index);
    if(route){
      this.goBack(currentRoute, route);
    }else{
      this.setCurrentIndex(index);
    }
  }

  goBack(currentRoute: ActivatedRoute, route: string = null){
    if(!route){ route = this.getPreviousRoute(); }
    if(route){
      this._router.navigate(['../', route], {relativeTo: currentRoute});
    }
  }

  goNext(currentRoute: ActivatedRoute){
    this.updateStatus(true);

    const route = this.getNextRoute();
    if(route){
      this._router.navigate(['../', route], {relativeTo: currentRoute});
    }else{
      let isCompleteAll = true;
      for(let data of this.questionnaireData){
        if(!data.isComplete){
          isCompleteAll = false;
          break;
        }
      }
      this.emitFinish(isCompleteAll);
    }
  }

  updateStatus(isComplete: boolean){
    this.questionnaireData[this.currentIndex].isComplete = isComplete;
  }

  updateUser(data: any){
    Object.keys(data).forEach(key => {
      if(key == 'phone'){
        let phone = data.phone.replace(/[\(\)\-]/g, '').trim();
        this.user[key] = phone;
      }
      else if(key == 'longitude'){
        if(!this.user.location){ this.user.location = [0,0]; }
        this.user.location[0] = data.longitude;
      }
      else if(key == 'latitude'){
        if(!this.user.location){ this.user.location = [0,0]; }
        this.user.location[1] = data.latitude;
      }
      else{
        this.user[key] = data[key];
      }
    });
  }

  updateUserTracking(data: any){
    Object.keys(data).forEach(key => {
      this.userTracking[key] = data[key];
    });
  }
}

export interface QuestionnaireItemData {
  label: string;
  route: string;
  isComplete: boolean;
}
