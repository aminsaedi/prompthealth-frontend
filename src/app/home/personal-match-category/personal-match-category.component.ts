import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RegisterQuestionnaireService } from 'src/app/dashboard/register-questionnaire.service';
import { FormItemCustomerHealthComponent } from 'src/app/shared/form-item-customer-health/form-item-customer-health.component';
import { FormItemServiceComponent } from 'src/app/shared/form-item-service/form-item-service.component';


@Component({
  selector: 'app-personal-match-category',
  templateUrl: './personal-match-category.component.html',
  styleUrls: ['./personal-match-category.component.scss']
})
export class PersonalMatchCategoryComponent implements OnInit {

  public data: string[];
  public type: string;
  public title: string;
  public form: FormGroup;

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
      this.data = user.services ? user.services : [];
    });
  }

  update(){
    const data: {[k: string]: string[]} = {}
    const dataTracking: {[k: string]: string[]} = {}

    data.services = this.formServiceComponent.getSelected(); 
    dataTracking.services = this.formServiceComponent.getSelected();

    this._qService.updateUser(data);
    this._qService.updateUserTracking(dataTracking);
    this._qService.goNext(this._route);
  }

}
