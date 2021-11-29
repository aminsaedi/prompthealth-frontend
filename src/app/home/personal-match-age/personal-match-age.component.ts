import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RegisterQuestionnaireService } from 'src/app/dashboard/register-questionnaire.service';
import { age_range_detail } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { FormItemSelectBoxComponent } from 'src/app/shared/form-item-select-box/form-item-select-box.component';
import { validators } from 'src/app/_helpers/form-settings';

@Component({
  selector: 'app-personal-match-age',
  templateUrl: './personal-match-age.component.html',
  styleUrls: ['./personal-match-age.component.scss']
})
export class PersonalMatchAgeComponent implements OnInit {

  public form: FormControl;
  public type: string;
  public isSubmitted = false;
  public title: string;
  public dataAge = age_range_detail;

  private subscriptionSubmit: Subscription;

  @ViewChild('formAge') private formAge: FormItemSelectBoxComponent;

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

    const data = this._route.snapshot.data;
    this._qService.canActivate(this._route, data.index);

    this.form = new FormControl(null, validators.personalMatchAgeRange);  

    const user = this._qService.getUserTracking();
    if(user.age_range?.length > 0) {
      const ageRange = user.age_range[0];
      this.formAge.setItem(this.dataAge.find(item => item.value == ageRange));
    }
  }

  update(){
    this.isSubmitted = true;
    const selectedAgeRange = this.formAge.selectedItem;
    this.form.setValue(selectedAgeRange ? [selectedAgeRange.value] : null);

    if(this.form.invalid){
      this._toastr.error('There is an item that requires your attention');
      return;
    }

    this._qService.updateUser({age_range: [this.form.value]});
    this._qService.updateUserTracking({age_range: this.form.value});

    this._qService.goNext(this._route);
  }
}
