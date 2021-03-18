import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RegisterQuestionnaireService } from '../register-questionnaire.service'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register-partner-term',
  templateUrl: './register-partner-term.component.html',
  styleUrls: ['./register-partner-term.component.scss']
})
export class RegisterPartnerTermComponent implements OnInit {

  private subscriptionNavigation: Subscription;

  constructor(
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
  ) {
  }
  
  ngOnDestroy(){
    if(this.subscriptionNavigation){ this.subscriptionNavigation.unsubscribe(); }
  }

  ngOnInit(): void {
    this.subscriptionNavigation = this._qService.observeNavigation().subscribe(type => {
      if(type == 'next'){ this.onSubmit(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });
    this._route.data.subscribe((data: {index: number, next?: string})=>{
      this._qService.canActivate(this._route, data.index);
    });
  }  

  onSubmit(){
    this._qService.updateUser({accredited_provide_canada: true});
    this._qService.goNext(this._route);
  }
}
