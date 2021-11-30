import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RegisterQuestionnaireService } from 'src/app/dashboard/register-questionnaire.service';
import { CheckboxSelectionItem } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { FormItemSelectBoxComponent } from 'src/app/shared/form-item-select-box/form-item-select-box.component';
import { QuestionnaireService, Questionnaire } from 'src/app/shared/services/questionnaire.service';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'app-personal-match-gender',
  templateUrl: './personal-match-gender.component.html',
  styleUrls: ['./personal-match-gender.component.scss']
})
export class PersonalMatchGenderComponent implements OnInit {

  public form: FormGroup;
  public isSubmitted = false;

  public qGender: Questionnaire;
  public dataGender: CheckboxSelectionItem[];
  public qSpGender: Questionnaire;
  public dataSpGender: CheckboxSelectionItem[];

  private subscriptionSubmit: Subscription;

  get f() { return this.form.controls; };

  @ViewChild('formGender') private formGender: FormItemSelectBoxComponent;
  @ViewChild('formSpGender') private formSpGender: FormItemSelectBoxComponent;
  
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
    this.form = new FormGroup({
      gender: new FormControl(null, validators.personalMatchGender),
      spGender: new FormControl(null, validators.personalMatchGender),
    });

    const data = this._route.snapshot.data;
    this._qService.canActivate(this._route, data.index);

    this.subscriptionSubmit = this._qService.observeNavigation().subscribe((type) => {
      if(type == 'next'){ this.update(); }
      else if(type == 'back'){ this._qService.goBack(this._route); }
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
        value: a.item_text.toLowerCase().replace('-', ''),
      });
    });

    q.spGender.answers.forEach((a,i)=>{
      this.dataSpGender.push({
        id: 'spGender' + i,
        label: a.item_text,
        value: a.item_text.toLowerCase().replace('-', ''),
      });
    });

    const clientData = this._qService.getUserTracking();
    const filterData = this._qService.getUser();
    
    if(clientData.gender) {
      const genderData = this.dataGender.find(item => item.value == clientData.gender);
      this.formGender.setItem(genderData);
    }

    if(filterData.gender) {
      const genderData = this.dataSpGender.find(item => item.value == filterData.gender);
      this.formSpGender.setItem(genderData);
    }
  }


  update() {
    this.f.gender.setValue(this.formGender.selectedItem?.value || null);
    this.f.spGender.setValue(this.formSpGender.selectedItem?.value || null);

    this.isSubmitted = true;
    if(this.form.invalid){
      this._toastr.error('There are some items that require your attention');
      return;
    }

    this._qService.updateUserTracking({gender: this.f.gender.value});
    this._qService.updateUser({gender: this.f.spGender.value});

    this._qService.goNext(this._route);
  }
}
