import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { IUserDetail } from 'src/app/models/user-detail';
import { FormCentreGeneralComponent } from 'src/app/shared/form-centre-general/form-centre-general.component';
import { FormProviderGeneralComponent } from 'src/app/shared/form-provider-general/form-provider-general.component';
import { BehaviorService } from 'src/app/shared/services/behavior.service';
import { validators } from 'src/app/_helpers/form-settings';
import { RegisterQuestionnaireService } from '../register-questionnaire.service';

@Component({
  selector: 'app-register-practitioner-general',
  templateUrl: './register-practitioner-general.component.html',
  styleUrls: ['./register-practitioner-general.component.scss']
})
export class RegisterPractitionerGeneralComponent implements OnInit {

  public user: IUserDetail;
  public fAccredit: FormControl;
  public isSubmitted: boolean = false;

  @ViewChild(FormCentreGeneralComponent) private formCentreComponent: FormCentreGeneralComponent;
  @ViewChild(FormProviderGeneralComponent) private formProviderComponent: FormProviderGeneralComponent;

  private subscriptionNavigation: Subscription;

  constructor(
    private _bsService: BehaviorService,
    private _qService: RegisterQuestionnaireService,
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
  ) {
  }
  
  ngOnDestroy(){
    if(this.subscriptionNavigation){ this.subscriptionNavigation.unsubscribe(); }
  }

  ngOnInit(): void {
    this.user = this._qService.getUser();
    this.fAccredit = new FormControl((this.user.accredited_provide_canada) ? true : false, validators.accredit);

    this.subscriptionNavigation = this._qService.observeNavigation().subscribe(type => {
      if(type == 'next'){
        switch(this.user.roles) {
          case 'C' : this.formCentreComponent.onSubmit(); break;
          case 'SP': this.formProviderComponent.onSubmit(); break;
        }
      }
      else if(type == 'back'){ this._qService.goBack(this._route); }
    });

    this._route.data.subscribe((data: {index: number, next?: string})=>{
      this._qService.canActivate(this._route, data.index);
    });
  }


  onChangeImage(imageURL: string){
    this._bsService.setUserDataOf('profileImage', imageURL);
    this._qService.updateUser({profileImage: imageURL});
  }

  update(data: IUserDetail){
    if(this.fAccredit.invalid){
      this.isSubmitted = true;
      this._toastr.error('There is an item that requires your attention.');
      return;
    }

    data.accredited_provide_canada = this.fAccredit.value;

    this._qService.updateUser(data);
    this._qService.goNext(this._route);
  }
}
