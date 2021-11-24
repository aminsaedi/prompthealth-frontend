import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RegisterQuestionnaireService } from '../register-questionnaire.service'; 
import { Subscription } from 'rxjs';
import { BehaviorService } from '../../shared/services/behavior.service'; 
import { FormPartnerServiceComponent } from 'src/app/shared/form-partner-service/form-partner-service.component';

@Component({
  selector: 'app-register-partner-service',
  templateUrl: './register-partner-service.component.html',
  styleUrls: ['./register-partner-service.component.scss']
})
export class RegisterPartnerServiceComponent implements OnInit {

  public user: any;

  private subscriptionNavigation: Subscription;

  @ViewChild(FormPartnerServiceComponent) formServiceCompoennt: FormPartnerServiceComponent

  /** copy start */
  constructor(
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
    private _bsService: BehaviorService,
  ) {
  }
  
  ngOnDestroy(){
    if(this.subscriptionNavigation){ this.subscriptionNavigation.unsubscribe(); }
  }

  ngOnInit(): void {
    this.user = this._qService.getUser();

    this.subscriptionNavigation = this._qService.observeNavigation().subscribe(type => {
      if(type == 'next'){ this.formServiceCompoennt.onSubmit(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });
    this._route.data.subscribe((data: {index: number, next?: string})=>{
      this._qService.canActivate(this._route, data.index);
    });
  }
  /** copy end */

  /** original start */
  onChangeUploadedImages(images: string[]){
    this._bsService.setUserDataOf('image', images);
    this._qService.updateUser({image: images});
  }

  update(data: any){
    /** update only services. image is updated right after it's uploaded */
    this._qService.updateUser({services: data.services});
    this._qService.goNext(this._route);
  }
}
