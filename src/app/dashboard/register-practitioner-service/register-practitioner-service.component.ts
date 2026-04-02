import { Component, OnInit, ViewChild , OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription , Subject } from 'rxjs';
import { IUserDetail } from 'src/app/models/user-detail';
import { FormPractitionerServiceComponent } from 'src/app/shared/form-practitioner-service/form-practitioner-service.component';
import { BehaviorService } from 'src/app/shared/services/behavior.service';
import { RegisterQuestionnaireService } from '../register-questionnaire.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-register-practitioner-service',
  templateUrl: './register-practitioner-service.component.html',
  styleUrls: ['./register-practitioner-service.component.scss']
})
export class RegisterPractitionerServiceComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();


  public user: IUserDetail;
  private subscriptionNavigation: Subscription;

  @ViewChild(FormPractitionerServiceComponent) formServiceComponent: FormPractitionerServiceComponent;

  constructor(
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
  ) {
  }
  
  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
    if(this.subscriptionNavigation){ this.subscriptionNavigation.unsubscribe(); }
  }

  ngOnInit(): void {
    this.user = this._qService.getUser();

    this.subscriptionNavigation = this._qService.observeNavigation().pipe(takeUntil(this.destroy$)).subscribe(type => {
      if(type == 'next'){
          this.formServiceComponent.onSubmit();
      }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });

    this._route.data.subscribe((data: {index: number, next?: string})=>{
      this._qService.canActivate(this._route, data.index);
    });
  }

  update(data: any){
    this._qService.updateUser(data);
    this._qService.goNext(this._route);
  }
}
