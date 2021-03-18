import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterQuestionnaireService, QuestionnaireItemData } from '../register-questionnaire.service';
import { HeaderStatusService } from '../../shared/services/header-status.service';

import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorService } from '../../shared/services/behavior.service';

@Component({
  selector: 'app-register-partner',
  templateUrl: './register-partner.component.html',
  styleUrls: ['./register-partner.component.scss']
})
export class RegisterPartnerComponent implements OnInit {

  public data: QuestionnaireItemData[] = [
    {label: 'General Information',     isComplete: false, route: 'general'},
    {label: 'Company services',        isComplete: false, route: 'service'},
    {label: 'Offer for Prompt Health', isComplete: false, route: 'offer'},
    {label: 'Terms and Conditions',    isComplete: false, route: 'term'},
  ];
  
  public currentIdx: number = 0;

  private subscriptionIndex: Subscription; 
  private subscriptionFinish: Subscription;


  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _router: Router,
    private _qService: RegisterQuestionnaireService,
    private _headerService: HeaderStatusService,
    private _toastr: ToastrService,
    private _sharedService: SharedService,
    private _bsService: BehaviorService,
  ){
  }

  ngOnDestroy(){
    if(this.subscriptionIndex){ this.subscriptionIndex.unsubscribe(); }
    if(this.subscriptionFinish){ this.subscriptionFinish.unsubscribe(); }
  }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user'));
    this._qService.init(this.data, {
      _id: user._id, 
      email: user.email, 
      // profileImage: user.profileImage,
      // image: user.image
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
          this._router.navigate(['/dashboard/register-partner/complete']);
          
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
