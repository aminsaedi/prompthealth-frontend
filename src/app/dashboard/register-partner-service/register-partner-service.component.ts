import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RegisterQuestionnaireService } from '../register-questionnaire.service'; 
import { Subscription } from 'rxjs';
import { BehaviorService } from '../../shared/services/behavior.service'; 

@Component({
  selector: 'app-register-partner-service',
  templateUrl: './register-partner-service.component.html',
  styleUrls: ['./register-partner-service.component.scss']
})
export class RegisterPartnerServiceComponent implements OnInit {

  public user: any;
  private selectedServices: string[] = [];

  private subscriptionNavigation: Subscription;

  /** copy start */
  constructor(
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _bsService: BehaviorService,
  ) {
  }
  
  ngOnDestroy(){
    if(this.subscriptionNavigation){ this.subscriptionNavigation.unsubscribe(); }
  }

  ngOnInit(): void {
    this.user = this._qService.getUser();
    this.selectedServices = this.user.services || [];

    this.subscriptionNavigation = this._qService.observeNavigation().subscribe(type => {
      if(type == 'next'){ this.onSubmit(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });
    this._route.data.subscribe((data: {index: number, next?: string})=>{
      this._qService.canActivate(this._route, data.index);
    });
  }
  /** copy end */

  /** original start */
  onChangeSelectedServices(services: string[]){
    this.selectedServices = services;
  }

  onChangeUploadedImages(images: string[]){
    this._bsService.setUserDataOf('image', images);
    this._qService.updateUser({image: images});
  }

  onSubmit(){
    if(this.selectedServices.length == 0){
      this._toastr.error('Please select at least 1 service.');
      return;
    }

    /** update only services. image is updated right after it's uploaded */
    this._qService.updateUser({services: this.selectedServices});
    this._qService.goNext(this._route);
  }
}
