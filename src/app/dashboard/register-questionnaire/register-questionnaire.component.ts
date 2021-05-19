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

@Component({
  selector: 'app-register-partner',
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
        {label: 'Offer for PromptHealth',  isComplete: false, route: 'offer'},
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
      if(!isCompleteAll){
        this._toastr.error('You haven\'t enter some sections. Please review from beginning.');
      }
      else{ 
        this._sharedService.loader('show');
        try{
          this.save(); 
          this._router.navigate(['/dashboard/register-product/complete'], {queryParams: {type: this.registerType}});
          
        }catch(err){
          this._toastr.error(err);
        }finally{
          this._sharedService.loader('hide');
        }
      }
    });
  }

  async save(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const data = this._qService.getUser();
      this._sharedService.post(data, 'user/updateProfile').subscribe((res: any) => {
        this._sharedService.loader('hide');
        if(res.statusCode == 200){
          this._bsService.setUserData(res.data);
          resolve(true);
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
}

export type RegisterType = 'product' | 'practitioner';
