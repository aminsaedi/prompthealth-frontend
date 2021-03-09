import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RegisterQuestionnaireService, QuestionnaireItemData } from '../register-questionnaire.service';
import { HeaderStatusService } from '../../shared/services/header-status.service';

import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

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
    private _qService: RegisterQuestionnaireService,
    private _headerService: HeaderStatusService,
    private _toastr: ToastrService,
  ){
    this._qService.init(this.data);
  }

  ngOnDestroy(){
    if(this.subscriptionIndex){ this.subscriptionIndex.unsubscribe(); }
    if(this.subscriptionFinish){ this.subscriptionFinish.unsubscribe(); }
  }

  ngOnInit(): void {
    this.subscriptionIndex = this._qService.observeIndex().subscribe((i: number) => {
      this.currentIdx = i;
      this._changeDetector.detectChanges();
    });

    this.subscriptionFinish = this._qService.observeFinish().subscribe((isCompleteAll: boolean) => {
      if(!isCompleteAll){
        this._toastr.error('You haven\'t enter some sections. Please review from beginning.');
      }
      else{
        this._toastr.success('Thank you for answering all answers!');
      }
    });

  }

  onClickNavigation(type: string){ this._qService.navigateByParent(type); }



  changeStickyStatus(isSticked: boolean){
  if(isSticked){ this._headerService.hideHeader(); } else{ this._headerService.showHeader(); }
  }

  
}
