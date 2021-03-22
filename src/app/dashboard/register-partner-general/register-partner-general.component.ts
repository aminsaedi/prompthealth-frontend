import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorService } from '../../shared/services/behavior.service';
import { RegisterQuestionnaireService } from '../register-questionnaire.service'; 
import { Subscription } from 'rxjs';
import { FormPartnerGeneralComponent } from '../../shared/form-partner-general/form-partner-general.component';

@Component({
  selector: 'app-register-partner-general',
  templateUrl: './register-partner-general.component.html',
  styleUrls: ['./register-partner-general.component.scss']
})
export class RegisterPartnerGeneralComponent implements OnInit {


  public user: any;
  @ViewChild(FormPartnerGeneralComponent) private formGeneralComponent: FormPartnerGeneralComponent;

  private subscriptionNavigation: Subscription;

  constructor(
    private _bsService: BehaviorService,
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
  ) {
  }
  
  ngOnDestroy(){
    if(this.subscriptionNavigation){ this.subscriptionNavigation.unsubscribe(); }
  }

  ngOnInit(): void {
    this.user = this._qService.getUser();

    this.subscriptionNavigation = this._qService.observeNavigation().subscribe(type => {
      if(type == 'next'){ this.formGeneralComponent.onSubmit(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });

    this._route.data.subscribe((data: {index: number, next?: string})=>{
      this._qService.canActivate(this._route, data.index);
    });
  }


  onChangeImage(imageURL: string){
    this._bsService.setUserDataOf('profileImage', imageURL);
    this._qService.updateUser({profileImage: imageURL});
  }

  update(data: any){
    this._qService.updateUser(data);
    this._qService.goNext(this._route);
  }
}

