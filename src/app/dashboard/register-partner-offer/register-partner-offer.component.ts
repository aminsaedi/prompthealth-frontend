import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RegisterQuestionnaireService } from '../register-questionnaire.service'; 
import { Subscription } from 'rxjs';
import { PartnerOfferData, FormPartnerOfferComponent } from '../../shared/form-partner-offer/form-partner-offer.component';

@Component({
  selector: 'app-register-partner-offer',
  templateUrl: './register-partner-offer.component.html',
  styleUrls: ['./register-partner-offer.component.scss']
})
export class RegisterPartnerOfferComponent implements OnInit {

  public user: any;
  @ViewChild(FormPartnerOfferComponent) private formOfferComponent: FormPartnerOfferComponent;

    private subscriptionNavigation: Subscription;


  /** copy start */
  constructor(
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
  ) {
  }
  
  ngOnDestroy(){
    if(this.subscriptionNavigation){ this.subscriptionNavigation.unsubscribe(); }
  }

  ngOnInit(): void {
    this.user = this._qService.getUser();

    this.subscriptionNavigation = this._qService.observeNavigation().subscribe(type => {
      if(type == 'next'){ this.formOfferComponent.onSubmit(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });
    this._route.data.subscribe((data: {index: number, next?: string})=>{
      this._qService.canActivate(this._route, data.index);
      // this._qService.setCurrentIndex(data.index);
    });
  }
  /** copy end */

  /** original start */

  update(data: PartnerOfferData){
    this._qService.updateUser(data);
    this._qService.goNext(this._route);
  }
}