import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RegisterQuestionnaireService } from 'src/app/dashboard/register-questionnaire.service';
import { CheckboxSelectionItem } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { QuestionnaireService, Questionnaire } from 'src/app/shared/services/questionnaire.service';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'app-user-questionnaire-item-gender',
  templateUrl: './user-questionnaire-item-gender.component.html',
  styleUrls: ['./user-questionnaire-item-gender.component.scss']
})
export class UserQuestionnaireItemGenderComponent implements OnInit {

  public form: FormGroup;
  public isSubmitted = false;

  public qGender: Questionnaire;
  public dataGender: CheckboxSelectionItem[];
  public qSpGender: Questionnaire;
  public dataSpGender: CheckboxSelectionItem[];

  private subscriptionSubmit: Subscription;

  get f() { return this.form.controls; };
  
  constructor(
    private _questionnaireService: QuestionnaireService,
    private _qService: RegisterQuestionnaireService,
    private _toastr: ToastrService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
  ) { }

  ngOnDestroy(){
    this.subscriptionSubmit.unsubscribe();
  }

  async ngOnInit() {
    this.subscriptionSubmit = this._qService.observeNavigation().subscribe((type) => {
      if(type == 'next'){ this.update(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });

    this._route.data.subscribe((data: {index: number, q: string}) => {
      this._qService.canActivate(this._route, data.index);
      const clientData = this._qService.getUserTracking();
      const filterData = this._qService.getUser();

      this.form = this._fb.group({
        gender: new FormControl(clientData.gender ? clientData.gender : null, validators.personalMatchGender),
        spGender: new FormControl(filterData.gender ? filterData.gender : null, validators.personalMatchGender),
      });
    });

    const q = await this._questionnaireService.getPersonalMatch();
    this.qGender = q.gender;
    this.qSpGender = q.spGender;

    this.dataGender = [];
    this.dataSpGender = [];

    q.gender.answers.forEach((a,i)=>{
      this.dataGender.push({
        id: 'gender' + i,
        label: a.item_text,
        value: a.item_text,
      });
    });
    q.spGender.answers.forEach((a,i)=>{
      this.dataSpGender.push({
        id: 'spGender' + i,
        label: a.item_text,
        value: a.item_text,
      });
    });
  }

  update() {
    this.isSubmitted = true;
    if(this.form.invalid){
      this._toastr.error('There is some items that require your attention');
      return;
    }

    this._qService.updateUserTracking({gender: this.f.gender.value});
    this._qService.updateUser({gender: this.f.spGender.value});

    this._qService.goNext(this._route);
  }
}
