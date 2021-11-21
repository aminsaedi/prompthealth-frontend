import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterQuestionnaireService, QuestionnaireItemData } from '../register-questionnaire.service';
import { HeaderStatusService } from '../../shared/services/header-status.service';

import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';
import { IUserDetail } from 'src/app/models/user-detail';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { IDefaultPlan } from 'src/app/models/default-plan';
import { ProfileManagementService } from '../../shared/services/profile-management.service';

@Component({
  selector: 'app-register-questionnaire',
  templateUrl: './register-questionnaire.component.html',
  styleUrls: ['./register-questionnaire.component.scss']
})
export class RegisterQuestionnaireComponent implements OnInit {

  public data: QuestionnaireItemData[] = [];
  public userRole: string = null;
  
  public currentIdx: number = 0;

  private subscriptionIndex: Subscription; 
  private subscriptionFinish: Subscription;
  private registerType: RegisterType;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _router: Router,
    private _route: ActivatedRoute,
    private _qService: RegisterQuestionnaireService,
    private _profileService: ProfileManagementService,
    private _headerService: HeaderStatusService,
    private _toastr: ToastrService,
    private _sharedService: SharedService,
    private _bsService: BehaviorService,
    private _uService: UniversalService,
  ){
  }

  ngOnDestroy(){
    if(this.subscriptionIndex){ this.subscriptionIndex.unsubscribe(); }
    if(this.subscriptionFinish){ this.subscriptionFinish.unsubscribe(); }
  }

  ngOnInit(): void {
    this._uService.setMeta(this._router.url, {
      title: 'Registration questionnaire | PromptHealth',
    });

    const user: IUserDetail = JSON.parse(localStorage.getItem('user'));
    this.userRole = user.roles;
    this.data = 
      (this.userRole == 'P') ? [
        {label: 'General Information',     isComplete: false, route: 'general'},
        {label: 'Company Services',        isComplete: false, route: 'service'},
        // {label: 'Offer for PromptHealth',  isComplete: false, route: 'offer'},
        {label: 'Terms and Conditions',    isComplete: false, route: 'term'},
      ] : 
      (this.userRole == 'SP' || this.userRole == 'C') ? [
        {label: 'General Information',     isComplete: false, route: 'general'},
        {label: 'Services',        isComplete: false, route: 'service'},
        {label: 'Terms and Conditions',    isComplete: false, route: 'term'},
      ] : []
  
    this._qService.init(this.data, {
      _id: user._id, 
      email: user.email,
      roles: user.roles,
    });

    this._route.data.subscribe((data: {type: RegisterType}) => {
      this.registerType = data.type;
    });

    this.subscriptionIndex = this._qService.observeIndex().subscribe((i: number) => {
      this.currentIdx = i;
      this._changeDetector.detectChanges();
    });

    this.subscriptionFinish = this._qService.observeFinish().subscribe((isCompleteAll: boolean) => {
      this.onQuestionnaireDone(isCompleteAll);
    });
  }

  async onQuestionnaireDone(isCompleteAll: boolean){
    if(!isCompleteAll){
      this._toastr.error('You haven\'t enter some sections. Please review from beginning.');
    }
    else{ 
      this._sharedService.loader('show');
      try{
        const user = await this.save();
        const plan = this.retrieveSelectedPlan();
        if(plan) {
          try {
            const monthly = (this._uService.sessionStorage.getItem('selectedMonthly') === 'true') ? true : false;
            const result = await this._sharedService.checkoutPlan(user, plan, 'default', monthly);
            switch(result.nextAction) {
              case 'complete':
                this._router.navigate(['/community']);
                this._toastr.success('Thank you for joining us. You can always upgrade your plan!');
                break;
              case 'stripe':
                //automatically redirect to stripe. nothing to do.
                this._toastr.success(result.message);
                break;
            }
          } catch(error) {
            this._toastr.error(error);
          }
        } else {
          this._toastr.error('You haven\'t selected plan yet. Please select Plan.');
          const route = ['/plans'];
          if(this.userRole == 'P') { route.push('product'); }
          this._router.navigate(route); 
        }
      }catch(err){
        this._toastr.error(err);
      }finally{
        this._sharedService.loader('hide');
      }
    }
  }

  async save(): Promise<IUserDetail> {
    return new Promise((resolve, reject) => {
      const data = this._qService.getUser();
      data.questionnaireCompleted = true;

      // profileImage will be updated at uploading image. so profileImage should not be updated here.
      delete data.profileImage;

      this._sharedService.post(data, 'user/updateProfile').subscribe((res: any) => {
        this._sharedService.loader('hide');
        if(res.statusCode == 200){
          this._bsService.setUserData(res.data);
          this._profileService.update(data);
          resolve(res.data);
        }else{
          reject(res.message);
        }
      }, error => {
        console.log(error);
        reject('There are some errors, please try again after some time.');
      });
    });
  }

  onClickNavigation(type: string){ this._qService.navigateByParent(type); }

  changeStickyStatus(isSticked: boolean){
    if(isSticked){ 
      this._headerService.hideHeader();
    } else{ 
      this._headerService.showHeader(); 
    }
  }  

  retrieveSelectedPlan(): IDefaultPlan {
    const user = this._profileService.user;
    if (user.plan) {
      return user.plan;
    } else {
      let planSelected: IDefaultPlan = null;
      const planStr = this._uService.sessionStorage.getItem('selectedPlan');
      if(planStr) {
        const plan: IDefaultPlan = JSON.parse(planStr);
        if(plan.userType.includes(this.userRole)) {
          planSelected = plan;
        }
      }
      return planSelected;  
    }
  }
}

export type RegisterType = 'product' | 'practitioner';
