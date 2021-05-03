import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormItemCustomerHealthComponent, CustomerHealthSelectionItem } from 'src/app/shared/form-item-customer-health/form-item-customer-health.component';
import { Questionnaire, QuestionnaireAnswer, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { RegisterQuestionnaireService } from '../register-questionnaire.service';

@Component({
  selector: 'app-user-questionnaire-item-background',
  templateUrl: './user-questionnaire-item-background.component.html',
  styleUrls: ['./user-questionnaire-item-background.component.scss']
})
export class UserQuestionnaireItemBackgroundComponent implements OnInit {

  public qBackground: Questionnaire;
  public selected: string[];
  public selections: QuestionnaireAnswer[];
  public form: FormGroup;
  
  private subscriptionSubmit: Subscription;

  @ViewChild(FormItemCustomerHealthComponent) formHealthComponent: FormItemCustomerHealthComponent;

  constructor(
    private _qService: RegisterQuestionnaireService,
    private _questionnaireService: QuestionnaireService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
  ) { }

  ngOnDestroy(){ this.subscriptionSubmit.unsubscribe(); }

  async ngOnInit() {
    this.form = this._fb.group({});
    
    this.subscriptionSubmit = this._qService.observeNavigation().subscribe((type) => {
      if(type == 'next'){ this.update(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });
    
    this._route.data.subscribe((data: {index: number, q: string}) => {
      this._qService.canActivate(this._route, data.index);

      const clientData = this._qService.getUserTracking();
      this.selected = clientData.customer_health;
    });

    const q = await this._questionnaireService.getPersonalMatch();
    this.qBackground = q.health;
    this.selections = q.health.answers;
    console.log(this.selections);
  }

  update(){
    this._qService.updateUser({customer_health: this.formHealthComponent.getSelectedValue()});
    this._qService.updateUserTracking({customer_health: this.formHealthComponent.getSelectedValueForTracking()});
   
    this._qService.goNext(this._route);
  }

}
