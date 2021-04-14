import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormItemCustomerHealthComponent } from 'src/app/shared/form-item-customer-health/form-item-customer-health.component';
import { FormItemServiceComponent } from 'src/app/shared/form-item-service/form-item-service.component';
import { RegisterQuestionnaireService } from '../register-questionnaire.service';


@Component({
  selector: 'app-user-questionnaire-item-select-multiple',
  templateUrl: './user-questionnaire-item-select-multiple.component.html',
  styleUrls: ['./user-questionnaire-item-select-multiple.component.scss']
})
export class UserQuestionnaireItemSelectMultipleComponent implements OnInit {

  public data: string[];
  public type: string;
  public title: string;

  private subscriptionSubmit: Subscription;

  @ViewChild(FormItemCustomerHealthComponent) formHealthComponent: FormItemCustomerHealthComponent;
  @ViewChild(FormItemServiceComponent) formServiceComponent: FormItemServiceComponent;

  constructor(
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
  ) {}

  ngOnDestroy(){ this.subscriptionSubmit.unsubscribe(); }

  ngOnInit(): void {
    this.subscriptionSubmit = this._qService.observeNavigation().subscribe((type) => {
      if(type == 'next'){ this.update(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });
    this._route.data.subscribe((data: {index: number, q: string}) => {
      this._qService.canActivate(this._route, data.index);
      const user = this._qService.getUserTracking();
      this.type = data.q;
      switch(data.q){
        case 'background':
          this.data = user.customer_health ? user.customer_health : [];
          this.title = 'Check the status of your health';
          break;
        case 'goal':
          this.data = user.services ? user.services : [];
          this.title = 'What are your health interests and goals for enrolling with Prompt Health?';
          break;
        default:
      }
    });
  }

  update(){
    const data: {[k: string]: string[]} = {}
    const dataTracking: {[k: string]: string[]} = {}
    switch(this.type){
      case 'background': 
        data.customer_health = this.formHealthComponent.getSelectedValue(); 
        dataTracking.customer_health = this.formHealthComponent.getSelectedValueForTracking();
        break;
      case 'goal': 
        data.services = this.formServiceComponent.getSelected(); 
        dataTracking.services = this.formServiceComponent.getSelected();
        break;
    }
    this._qService.updateUser(data);
    this._qService.updateUserTracking(dataTracking);
    this._qService.goNext(this._route);
  }

}
