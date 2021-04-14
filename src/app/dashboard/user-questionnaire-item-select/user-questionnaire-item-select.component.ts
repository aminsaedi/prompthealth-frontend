import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { validators } from 'src/app/_helpers/form-settings';
import { RegisterQuestionnaireService } from '../register-questionnaire.service';

@Component({
  selector: 'app-user-questionnaire-item-select',
  templateUrl: './user-questionnaire-item-select.component.html',
  styleUrls: ['./user-questionnaire-item-select.component.scss']
})
export class UserQuestionnaireItemSelectComponent implements OnInit {

  public form: FormControl;
  public type: string;
  public isSubmitted = false;
  public title: string;

  private subscriptionSubmit: Subscription;

  constructor(
    private _toastr: ToastrService,
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
  ) { }

  ngOnDestroy(){
    this.subscriptionSubmit.unsubscribe();
  }

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
        case 'gender':
          this.form = new FormControl(user.gender ? user.gender : null, validators.personalMatchGender);
          this.title = 'What gender do you identify as?';
          break;
        case 'age':
          this.form = new FormControl(user.age_range ? user.age_range : null, validators.personalMatchAgeRange);
          this.title = 'What is your age range or that of the loved one for whom you are seeking service?';
          break;
        default:
      }
    });
    
  }

  update(){
    this.isSubmitted = true;
    if(this.form.invalid){
      this._toastr.error('There is 1 item that requires your attention');
      return;
    }
    let data: {[k:string]: string} = {};
    if(this.type == 'gender'){ data.gender = this.form.value; }
    else if(this.type == 'age'){ data.age_range = this.form.value; }

    switch(this.type){
      case 'gender':
        this._qService.updateUserTracking({gender: this.form.value});
        break;
      case 'age':
        this._qService.updateUser({age_range: this.form.value});
        this._qService.updateUserTracking({age_range: this.form.value});
    }
    this._qService.goNext(this._route);

  }

}
